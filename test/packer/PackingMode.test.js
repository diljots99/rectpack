const { PackingMode } = require('../../src/rectpack/packer');

describe('PackingMode', () => {
    describe('enum values', () => {
        it('should have correct numeric values', () => {
            expect(PackingMode.Online).toBe(0);
            expect(PackingMode.Offline).toBe(1);
        });

        it('should be immutable', () => {
            const originalOnline = PackingMode.Online;
            const originalOffline = PackingMode.Offline;

            // Try to modify values
            PackingMode.Online = 100;
            PackingMode.Offline = 200;

            expect(PackingMode.Online).toBe(originalOnline);
            expect(PackingMode.Offline).toBe(originalOffline);
        });
    });

    describe('properties', () => {
        it('should have correct names for each mode', () => {
            expect(PackingMode.properties[0].name).toBe('Online');
            expect(PackingMode.properties[1].name).toBe('Offline');
        });

        it('should have properties for all enum values', () => {
            const modes = [PackingMode.Online, PackingMode.Offline];
            modes.forEach(mode => {
                expect(PackingMode.properties[mode]).toBeDefined();
                expect(PackingMode.properties[mode].name).toBeDefined();
            });
        });

        it('should not have properties for invalid modes', () => {
            expect(PackingMode.properties[2]).toBeUndefined();
            expect(PackingMode.properties[-1]).toBeUndefined();
        });
    });

    describe('usage', () => {
        it('should be usable in switch statements', () => {
            const getModeName = (mode) => {
                switch (mode) {
                    case PackingMode.Online:
                        return 'Online';
                    case PackingMode.Offline:
                        return 'Offline';
                    default:
                        return 'Unknown';
                }
            };

            expect(getModeName(PackingMode.Online)).toBe('Online');
            expect(getModeName(PackingMode.Offline)).toBe('Offline');
            expect(getModeName(99)).toBe('Unknown');
        });

        it('should be usable in equality comparisons', () => {
            expect(PackingMode.Online === 0).toBe(true);
            expect(PackingMode.Offline === 1).toBe(true);
            expect(PackingMode.Online === PackingMode.Offline).toBe(false);
        });
    });

    describe('object structure', () => {
        it('should have only the defined properties', () => {
            const properties = Object.keys(PackingMode);
            expect(properties).toHaveLength(3); // Online, Offline, properties
            expect(properties).toContain('Online');
            expect(properties).toContain('Offline');
            expect(properties).toContain('properties');
        });

        it('should have correct property descriptors', () => {
            const onlineDescriptor = Object.getOwnPropertyDescriptor(PackingMode, 'Online');
            const offlineDescriptor = Object.getOwnPropertyDescriptor(PackingMode, 'Offline');

            expect(onlineDescriptor.writable).toBe(false);
            expect(onlineDescriptor.configurable).toBe(false);
            expect(offlineDescriptor.writable).toBe(false);
            expect(offlineDescriptor.configurable).toBe(false);
        });
    });

    describe('error cases', () => {
        it('should not allow adding new modes', () => {
            expect(() => {
                PackingMode.NewMode = 2;
            }).toThrow();
        });

        it('should not allow modifying properties', () => {
            expect(() => {
                PackingMode.properties[0].name = 'Modified';
            }).toThrow();
        });

        it('should not allow deleting modes', () => {
            expect(() => {
                delete PackingMode.Online;
            }).toThrow();
        });
    });
});
