export type ResourceLicense = {
	/**
	 * SPDX license identifier.
	 * @see {@link https://spdx.org/licenses}
	 */
	spdxIdentifier: string;
};

export type ResourceKind =
	| 'Book'
	| 'BookChapter'
	| 'Journal'
	| 'JournalIssue'
	| 'JournalArticle'
	| 'Conference'
	| 'ConferenceProceeding'
	| 'ConferencePaper'
	| 'Other';

export type ResourceRelation =
	| 'Comment'
	| 'Preprint'
	| 'Reply'
	| 'Review'
	| 'Supplement'
	| 'Translation'
	| 'Version';

export type ResourceRelationship = {
	isParent: boolean;
	relation: ResourceRelation;
	resource: AnyResource;
};

export type ResourceContributorKind = 'Person' | 'Organization';
export type ResourceContributorRole = 'Creator' | 'Editor' | 'Translator' | 'Other';
export type ResourceContributor = { name: string; orcid?: string };

export type ResourceContribution = {
	isAttribution: boolean;
	contributor: ResourceContributor;
	contributorAffiliation: string | undefined;
	contributorRole: ResourceContributorRole;
};

export type ResourceDescriptor = 'Explanation' | 'Mechanism' | 'Process' | 'Definition' | 'Other';

export type ResourceDescription = {
	kind: ResourceDescriptor;
	/**
	 * ISO 639.2 language code.
	 */
	lang: string;

	text: string;
};

export type ResourceSummaryKind = 'Synopsis' | 'WordCount' | 'Other';

export type ResourceSummary = {
	kind: ResourceSummaryKind;

	/**
	 * ISO 639.2 language code.
	 */
	lang: string;

	value: string;
};

export type PartialResource = {
	/**
	 * The resource's canonical URL.
	 */
	url: string;
};

export type Resource = PartialResource & {
	/**
	 * The type of resource.
	 */
	kind: ResourceKind;

	/**
	 * The title of the resource.
	 */
	title: string;

	/**
	 * The version of the resource expressed as a UTC datetime string.
	 */
	timestamp: string;

	license: ResourceLicense;

	descriptions: ResourceDescription[];

	summaries: ResourceSummary[];

	contributions: ResourceContribution[];

	relationships: ResourceRelationship[];
};

export type AnyResource = PartialResource | Resource;
