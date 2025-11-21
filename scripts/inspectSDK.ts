import * as sdkModule from '@smoothsend/sdk';

console.log('SDK Module Exports:', sdkModule);

try {
    // Try default export if named export fails
    const SDKClass = (sdkModule as any).SmoothSendSDK || (sdkModule as any).default;

    if (SDKClass) {
        const sdk = new SDKClass({
            timeout: 30000,
            retries: 3,
            useDynamicConfig: true
        });

        console.log('SDK Instance Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(sdk)));

        if (sdk.addEventListener) {
            const result = sdk.addEventListener((e: any) => console.log(e));
            console.log('addEventListener returns:', result);
            console.log('Type of return:', typeof result);
        } else {
            console.log('addEventListener not found on instance');
        }
    } else {
        console.log('Could not find SDK class in exports');
    }
} catch (e) {
    console.error('Error:', e);
}
