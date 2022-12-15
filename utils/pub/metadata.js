import { getBestDownloadUrl } from 'utils/pub/downloads';
import { pubUrl } from 'utils/canonicalUrls';

export const getPdfDownloadUrl = (communityData, pubData) => {
	const hasPdfDownload = !!getBestDownloadUrl(pubData, 'pdf');
	if (hasPdfDownload) {
		return pubUrl(communityData, pubData, { download: 'pdf' });
	}
	return null;
};

export const getTextAbstract = (docJson) => {
	let abstract = '';
	if (!docJson) return abstract;
	const { content } = docJson;
	const [firstChild, secondChild] = content;
	const firstChildIsAbstractHeader =
		firstChild &&
		firstChild.type === 'heading' &&
		firstChild.attrs.level === 1 &&
		firstChild.content &&
		firstChild.content.length > 0 &&
		(firstChild.content[0].text || '').toLowerCase() === 'abstract';
	if (firstChildIsAbstractHeader && secondChild) {
		const { content: abstractContent } = secondChild;
		if (abstractContent) {
			abstractContent.forEach((item) => {
				switch (item.type) {
					case 'text':
						abstract += item.text;
						if (item.marks) {
							item.marks.forEach((mark) => {
								if (mark.type === 'link') {
									abstract += ` <${mark.attrs.href}> `;
								}
							});
						}
						break;
					case 'equation':
						abstract += item.attrs.value;
						break;
					default:
						break;
				}
			});
		}
	}
	return abstract;
};

const noteTypes = {
	chapter: 'book',
	book: 'book',
	proceedings: 'conference',
	'paper-conference': 'conference',
};

export const getGoogleScholarNotes = (notes) => {
	return notes
		.filter((note) => note.json !== '' && !!note.json[0] && !note.error)
		.reduce((unique, note) => {
			const noteArray = [];
			const noteType = note.json[0].type;
			const noteTypeString = noteTypes[noteType] || 'journal';

			Object.entries(note.json[0]).forEach(([key, value]) => {
				switch (key) {
					case 'title':
						noteArray.push(`citation_title=${value}`);
						break;
					case 'author':
						value.forEach((author) => {
							const authorText = author.literal || `${author.given} ${author.family}`;
							noteArray.push(`citation_author=${authorText}`);
						});
						break;
					case 'container-title':
						noteArray.push(`citation_${noteTypeString}_title=${value}`);
						break;
					case 'issued':
						if (value['date-parts']) {
							noteArray.push(
								`citation_publication_date=${value['date-parts'][0].join('/')}`,
							);
						}
						break;
					case 'issue':
					case 'volume':
					case 'DOI':
					case 'ISSN':
					case 'ISBN':
						noteArray.push(`citation_${key}=${value}`);
						break;
					default:
						break;
				}
			});
			return unique.includes(noteArray.join(';')) ? unique : [...unique, noteArray.join(';')];
		}, []);
};

export const getWordAndCharacterCountsFromDoc = (node) => {
	const text = node.textBetween(0, node.content.size, ' ', ' ');
	const words = text.split(' ').filter((word) => word !== '');
	return [words.length, text.length];
};
