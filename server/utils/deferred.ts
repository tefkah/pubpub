type Task = () => Promise<any>;
type Callback = () => unknown;

const createDeferredState = () => {
	let deferredCount = 0;
	let deferredCallbacks: Callback[] = [];

	const incrementCount = () => {
		deferredCount++;
	};

	const decrementCount = () => {
		deferredCount--;
		if (deferredCount === 0) {
			deferredCallbacks.forEach((cb) => cb());
			deferredCallbacks = [];
		}
	};

	const onDeferredTasksComplete = (callback: Callback) => {
		if (deferredCount === 0) {
			callback();
		} else {
			deferredCallbacks.push(callback);
		}
	};

	const awaitDeferredTasks = (): Promise<void> => {
		return new Promise((resolve) => onDeferredTasksComplete(resolve));
	};

	const defer = (task: Task) => {
		incrementCount();
		task().then(decrementCount);
	};

	return { awaitDeferredTasks, defer };
};

export const { defer, awaitDeferredTasks } = createDeferredState();
