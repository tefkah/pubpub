import * as types from 'types';
import { TaggedThreadParent } from 'types';
import { Discussion, Pub, ReviewNew, Visibility, VisibilityUser } from 'server/models';
import { getMembersForScope } from 'server/member/queries';

type CanUserSeeThreadOptions = {
	userId: string;
	threadId: string;
};

type FilterUsersOptions = {
	userIds: string[];
	threadId: string;
};

export const getParentModelForThread = async <AssociatedModels = {}>(
	threadId: string,
	queryOptions: any = {},
): Promise<null | TaggedThreadParent<AssociatedModels>> => {
	const [discussion, review]: [
		null | (types.Discussion & AssociatedModels),
		null | (types.Review & AssociatedModels),
	] = await Promise.all([
		Discussion.findOne({ where: { threadId }, ...queryOptions }),
		ReviewNew.findOne({ where: { threadId }, ...queryOptions }),
	]);
	if (discussion) {
		return { type: 'discussion', value: discussion };
	}
	if (review) {
		return { type: 'review', value: review };
	}
	return null;
};

export const filterUsersWhoCanSeeThread = async (
	options: FilterUsersOptions,
): Promise<string[]> => {
	const { userIds, threadId } = options;

	const parent = await getParentModelForThread<{
		visibility: types.Visibility;
		pub: types.Pub;
	}>(threadId, {
		include: [
			{ model: Visibility, as: 'visibility' },
			{ model: Pub, as: 'pub' },
		],
	});

	if (parent) {
		const {
			visibility: { access, id: visibilityId },
			pub,
		} = parent.value;
		if (access === 'public') {
			return userIds;
		}
		if (access === 'members') {
			const members = await getMembersForScope({
				communityId: pub.communityId,
				pubId: pub.id,
			});
			const memberUserIds = new Set(members.map((member) => member.userId));
			return userIds.filter((userId) => memberUserIds.has(userId));
		}
		const visibilityUsers = await VisibilityUser.findAll({ where: { visibilityId } });
		const visibilityUserIds = new Set(visibilityUsers.map((vu) => vu.userId));
		return userIds.filter((userId) => visibilityUserIds.has(userId));
	}
	return [];
};

export const canUserSeeThread = async (options: CanUserSeeThreadOptions): Promise<boolean> => {
	const { userId, threadId } = options;
	const [maybeUserId] = await filterUsersWhoCanSeeThread({ threadId, userIds: [userId] });
	return maybeUserId === userId;
};
