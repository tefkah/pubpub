import { CitationStyle, citationStyleKind, inlineCitationStyleKind } from 'facets';
import { citationStyles, citationInlineStyles } from 'utils/citations';

import { createFacetEditor } from '../../createFacetEditor';
import { dropdown } from '../../propTypeEditors';

const CitationStyleDropdown = dropdown<typeof citationStyleKind>({
	items: (() => {
		const items = {};
		citationStyles.forEach((style) => {
			items[style.key] = { label: style.name };
		});
		return items;
	})(),
});

const InlineCitationStyleDropdown = dropdown<typeof inlineCitationStyleKind>({
	items: (() => {
		const items = {};
		citationInlineStyles.forEach((style) => {
			items[style.key] = { label: style.title, rightElement: style.example };
		});
		return items;
	})(),
});

export default createFacetEditor(CitationStyle, {
	propEditors: {
		citationStyle: CitationStyleDropdown,
		inlineCitationStyle: InlineCitationStyleDropdown,
	},
});
