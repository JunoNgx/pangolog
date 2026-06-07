import { describe, expect, it } from "vitest";
import { mergeRecords } from "./syncEngine";

interface TestRecord {
    id: string;
    updatedAt: string;
    name: string;
}

describe("mergeRecords", () => {
    it("returns remote records when local is empty", () => {
        const remote: TestRecord[] = [
            { id: "a", updatedAt: "2024-01-01T00:00:00Z", name: "remote-a" },
        ];

        const result = mergeRecords([], remote);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("remote-a");
    });

    it("prefers remote when its updatedAt is newer", () => {
        const local: TestRecord[] = [
            { id: "a", updatedAt: "2024-01-01T00:00:00Z", name: "local-a" },
        ];
        const remote: TestRecord[] = [
            { id: "a", updatedAt: "2024-02-01T00:00:00Z", name: "remote-a" },
        ];

        const result = mergeRecords(local, remote);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("remote-a");
    });

    it("keeps local when its updatedAt is newer", () => {
        const local: TestRecord[] = [
            { id: "a", updatedAt: "2024-02-01T00:00:00Z", name: "local-a" },
        ];
        const remote: TestRecord[] = [
            { id: "a", updatedAt: "2024-01-01T00:00:00Z", name: "remote-a" },
        ];

        const result = mergeRecords(local, remote);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("local-a");
    });

    it("keeps local when timestamps are identical", () => {
        const local: TestRecord[] = [
            { id: "a", updatedAt: "2024-01-01T00:00:00Z", name: "local-a" },
        ];
        const remote: TestRecord[] = [
            { id: "a", updatedAt: "2024-01-01T00:00:00Z", name: "remote-a" },
        ];

        const result = mergeRecords(local, remote);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("local-a");
    });

    it("includes records that exist only in remote", () => {
        const local: TestRecord[] = [
            { id: "a", updatedAt: "2024-01-01T00:00:00Z", name: "local-a" },
        ];
        const remote: TestRecord[] = [
            { id: "a", updatedAt: "2024-01-01T00:00:00Z", name: "remote-a" },
            { id: "b", updatedAt: "2024-01-01T00:00:00Z", name: "remote-b" },
        ];

        const result = mergeRecords(local, remote);

        expect(result).toHaveLength(2);
        const names = result.map((r) => r.name).sort();
        expect(names).toEqual(["local-a", "remote-b"]);
    });
});
