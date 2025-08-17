export class TopicManager {
    /**
     * Converts a comma-separated byte string, Uint8Array, or ArrayBuffer into a parsed JSON object.
     * @param input - Either a comma-separated byte string (e.g. "123,34,99,…"), a Uint8Array, or an ArrayBuffer.
     * @returns The parsed JavaScript object.
     */
    public static parseBufferInput(
        input: string | Uint8Array | ArrayBuffer
    ): any {
        let uint8: Uint8Array;

        if (typeof input === 'string') {
            // From comma-separated string
            const byteArray = input.split(',').map(byte => {
                const val = parseInt(byte, 10);
                if (Number.isNaN(val)) {
                    throw new TypeError(`Invalid byte value: ${byte}`);
                }
                return val;
            });
            uint8 = new Uint8Array(byteArray);
        } else if (input instanceof ArrayBuffer) {
            // Direct ArrayBuffer
            uint8 = new Uint8Array(input);
        } else if (input instanceof Uint8Array) {
            // Already a Uint8Array
            uint8 = input;
        } else {
            throw new TypeError(
                'Input must be a string, ArrayBuffer, or Uint8Array'
            );
        }

        // Decode to UTF-8 string
        const decoder = new TextDecoder('utf-8');
        const jsonString = decoder.decode(uint8);

        // Parse JSON
        return JSON.parse(jsonString);
    }
}