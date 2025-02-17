/* eslint-disable no-restricted-syntax */
import { ForbiddenError } from 'server/utils/errors';
import {
	Commenter,
	Discussion,
	DiscussionAnchor,
	Thread,
	ThreadComment,
	ThreadEvent,
	Pub,
	Visibility,
	includeUserModel,
} from 'server/models';
import { getReadableDateInYear } from 'utils/dates';
import { createDiscussionAnchor } from 'server/discussionAnchor/queries';
import { createNewThreadWithComment } from 'server/thread/queries';
import { VisibilityAccess, DocJson } from 'types';

const findDiscussionWithUser = (id) =>
	Discussion.findOne({
		where: {
			id,
		},
		include: [
			includeUserModel({ as: 'author' }),
			{ model: Commenter, as: 'commenter' },
			{ model: DiscussionAnchor, as: 'anchors' },
			{
				model: Visibility,
				as: 'visibility',
				include: [includeUserModel({ as: 'users' })],
			},
			{
				model: Thread,
				as: 'thread',
				include: [
					{
						model: ThreadComment,
						as: 'comments',
						include: [includeUserModel({ as: 'author' })],
					},
					{
						model: ThreadEvent,
						as: 'events',
						include: [includeUserModel({ as: 'user' })],
					},
				],
			},
		],
	});

type CreateDiscussionOpts = {
	pubId: string;
	discussionId?: string;
	title?: string;
	text: string;
	content: DocJson;
	historyKey: number;
	visibilityAccess: 'members' | 'public';
	initAnchorData: {
		prefix?: string;
		suffix?: string;
		exact: string;
		from: number;
		to: number;
	};
	commenterName?: string;
	userId?: string;
};

export const createDiscussion = async (options: CreateDiscussionOpts) => {
	const {
		pubId,
		discussionId,
		title,
		text,
		content,
		historyKey,
		visibilityAccess,
		initAnchorData,
		commenterName,
		userId,
	} = options;

	const user = userId || null;
	const commenter = commenterName || null;

	const discussions = await Discussion.findAll({
		where: { pubId },
		attributes: ['id', 'pubId', 'number'],
	});

	// This is non-atomic and could create race conditions
	// if two people create new discussion threads at the same time
	// on the same pub
	const maxThreadNumber = discussions.reduce((max, nextDiscussion) => {
		if (nextDiscussion.number > max) {
			return nextDiscussion.number;
		}
		return max;
	}, 0);

	const dateString = getReadableDateInYear(new Date());
	const generatedTitle = `New Discussion on ${dateString}`;

	const { threadId, commenterId } = await createNewThreadWithComment({
		text,
		content,
		commenterName: commenter,
		userId: user,
	});

	const newVisibility = await Visibility.create({ access: visibilityAccess });
	const newDiscussion = await Discussion.create({
		id: discussionId,
		title: title || generatedTitle,
		number: maxThreadNumber + 1,
		threadId,
		visibilityId: newVisibility.id,
		userId,
		pubId,
		commenterId,
	});

	if (initAnchorData) {
		const { from, to, exact, prefix, suffix } = initAnchorData;
		await createDiscussionAnchor({
			discussionId: newDiscussion.id,
			historyKey,
			// If someday we wish to support Node selections we can pass a serialized Selection
			// from the client instead of synthesizing one here.
			selectionJson: { type: 'text', head: Math.max(from, to), anchor: Math.min(from, to) },
			originalText: exact,
			originalTextPrefix: prefix,
			originalTextSuffix: suffix,
		});
	}

	return findDiscussionWithUser(newDiscussion.id);
};

export const updateDiscussion = async (values, permissions) => {
	const { discussionId, pubId } = values;
	const { canTitle, canApplyPublicLabels, canApplyManagedLabels, canClose, canReopen } =
		permissions;
	const updatedValues: { [k: string]: any } = {};

	const [discussion, pub] = await Promise.all([
		Discussion.findOne({ where: { id: discussionId } }),
		Pub.findOne({ where: { id: pubId }, attributes: ['id', 'labels'] }),
	]);

	if ('title' in values) {
		if (canTitle) {
			updatedValues.title = values.title;
		} else {
			throw new ForbiddenError();
		}
	}

	if ('isClosed' in values) {
		const canModifyClosed = values.isClosed ? canClose : canReopen;
		if (canModifyClosed) {
			updatedValues.isClosed = values.isClosed;
		} else {
			throw new ForbiddenError();
		}
	}

	if ('labels' in values) {
		const labels: any[] = [];
		const existingLabels = discussion.labels || [];
		const hasRemovedManagedLabels = existingLabels.some((labelId) => {
			const labelDefinition = pub.labels.find((label) => label.id === labelId);
			const missingFromUpdate = !values.labels.includes(labelId);
			return labelDefinition && !labelDefinition.publicApply && missingFromUpdate;
		});
		if (hasRemovedManagedLabels && !canApplyManagedLabels) {
			throw new ForbiddenError();
		}
		for (const labelId of values.labels) {
			const isExistingLabel = existingLabels.includes(labelId);
			const labelDefinition = pub.labels.find((label) => label.id === labelId);
			if (labelDefinition) {
				const { publicApply } = labelDefinition;
				const canLabel = publicApply ? canApplyPublicLabels : canApplyManagedLabels;
				if (isExistingLabel || canLabel) {
					labels.push(labelId);
				} else {
					throw new ForbiddenError();
				}
			}
		}
		updatedValues.labels = labels;
	}

	await discussion.update(updatedValues);
	return discussion;
};

export const updateVisibilityForDiscussions = async (
	pubId: string,
	discussionIds: string[],
	access: VisibilityAccess,
) => {
	const discussions = await Discussion.findAll({ where: { pubId, id: discussionIds } });
	const visibilityIds = discussions.map((d) => d.visibilityId);
	await Visibility.update({ access }, { where: { id: visibilityIds } });
};
