import { CommunitySideBarDto } from "../types/types";

export default function buildVisibleItems(collapsableSet: Set<string>, sidebarItems?: CommunitySideBarDto[]): CommunitySideBarDto[] {
    const result: CommunitySideBarDto[] = [];

    if (!sidebarItems) return result;

    let currentCategoryCollapsed = false;

    for (const item of sidebarItems) {
        if (item.type === "CATEGORY") {
            currentCategoryCollapsed = collapsableSet.has(item.categoryId);
            result.push(item);
            continue;
        }

        if (!currentCategoryCollapsed) {
            result.push(item);
        }
    }

    return result;

}
export const toggleCategory = (categoryId: string, setCollapsed: Function) => {
    setCollapsed((prev: any) => {
        console.log("categoryId:", categoryId);
        const next = new Set(prev);
        console.log("prev:", [...prev]);

        if (next.has(categoryId)) {
            next.delete(categoryId);
        } else {
            next.add(categoryId);
        }
        console.log("nexta", [...next]);
        return next;
    });
};
