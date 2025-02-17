import { MightHave } from 'types/util';
import { InsertableActivityItemBase } from './base';

export type ThreadActivityItemBase = InsertableActivityItemBase & {
	payload: {
		threadId: string;
		isReply: boolean;
		threadComment: {
			id: string;
			text: string;
			userId: string;
		};
	};
};

export type MightHaveThreadCommentItemBase = Omit<ThreadActivityItemBase, 'payload'> & {
	payload: MightHave<ThreadActivityItemBase['payload'], 'threadComment'>;
};
