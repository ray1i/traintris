
// self.onmessage = (e: MessageEvent<string>) => {
//     console.log('Worker received:', e.data)
//     self.postMessage(e.data + ' and cats');
// };

// export default () => {
//     self.onmessage = (state) => {
//         self.postMessage('edc')
    
//         console.log('finished.')
//     }
// }


// eslint-disable-next-line no-restricted-globals
const ctx: Worker = self as any;

// Post data to parent thread
ctx.postMessage({ foo: "foo" });

// Respond to message from parent thread
ctx.addEventListener("message", (event) => console.log(event));

export {}