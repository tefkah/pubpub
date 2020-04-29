import { normalizeMetadataToKind } from 'shared/collections/metadata';
import { slugifyString, generateHash } from 'utils';
import { Collection, CollectionPub, Community } from '../models';

export const createCollection = ({ communityId, title, kind, pageId = null, isPublic = false }) => {
	return Community.findOne({ where: { id: communityId } }).then((community) => {
		const collection = {
			title: title.trim(),
			slug: slugifyString(title),
			isRestricted: true,
			isPublic: isPublic,
			viewHash: generateHash(8),
			editHash: generateHash(8),
			communityId: communityId,
			pageId: pageId,
			kind: kind,
		};
		const metadata = normalizeMetadataToKind({}, kind, {
			community: community,
			collection: collection,
		});
		return Collection.create({ ...collection, metadata: metadata }, { returning: true });
	});
};

export const updateCollection = (inputValues, updatePermissions) => {
	// Filter to only allow certain fields to be updated
	const filteredValues = {};
	Object.keys(inputValues).forEach((key) => {
		if (updatePermissions.includes(key)) {
			filteredValues[key] = inputValues[key];
		}
	});

	return Collection.update(filteredValues, {
		where: { id: inputValues.collectionId },
	})
		.then(() => {
			if (filteredValues.isPublic === false) {
				return CollectionPub.update(
					{ isPrimary: false },
					{ where: { isPrimary: true, collectionId: inputValues.collectionId } },
				);
			}
			return null;
		})
		.then(() => {
			return filteredValues;
		});
};

export const destroyCollection = (inputValues) => {
	return Collection.destroy({
		where: { id: inputValues.collectionId },
	});
};
