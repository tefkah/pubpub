import { getScope } from 'server/utils/queryHelpers';

export const getPermissions = async ({ userId, communityId, collectionId }) => {
	if (!userId) {
		return {};
	}
	const scopeData = await getScope({
		communityId,
		collectionId,
		loginId: userId,
	});
	const isAuthenticated = scopeData.activePermissions.canManage;
	if (!scopeData.elements.activeCollection) {
		return { create: isAuthenticated };
	}
	const editProps = [
		'title',
		'slug',
		'isRestricted',
		'isPublic',
		'pageId',
		'metadata',
		'readNextPreviewSize',
		'layout',
		'avatar',
	];
	return {
		create: isAuthenticated,
		update: isAuthenticated ? editProps : (false as const),
		destroy: isAuthenticated,
	};
};
