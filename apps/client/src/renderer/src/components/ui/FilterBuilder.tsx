import { useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { FiPlus, FiTrash2, FiChevronDown, FiChevronRight } from "react-icons/fi"
import Button from "./Button"
import Select from "./Select"
import Input from "./Input"

export type FilterOperator = "AND" | "OR"
export type ComparisonOperator = "=" | "!=" | ">" | "<" | ">=" | "<=" | "contains" | "starts with" | "ends with" | "in" | "not in"

export type SchemaField = {
  name: string
  label: string
  type: "text" | "number" | "date" | "boolean" | "select"
  options?: { value: string; label: string }[]
}

export type FilterCondition = {
  id: string
  field: string
  operator: ComparisonOperator
  value: string
}

export type FilterGroup = {
  id: string
  operator: FilterOperator
  conditions: (FilterCondition | FilterGroup)[]
}

const filterBuilderVariants = cva("border border-border rounded-lg bg-background", {
  variants: {
    size: {
      sm: "p-3 text-sm",
      md: "p-4 text-base",
      lg: "p-5 text-lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

type FilterBuilderProps = VariantProps<typeof filterBuilderVariants> & {
  schema: SchemaField[]
  onChange?: (filter: FilterGroup) => void
  initialFilter?: FilterGroup
  className?: string
}

const comparisonOperators: ComparisonOperator[] = [
  "=",
  "!=",
  ">",
  "<",
  ">=",
  "<=",
  "contains",
  "starts with",
  "ends with",
  "in",
  "not in",
]

export default function FilterBuilder({
  schema,
  onChange,
  initialFilter,
  size,
  className,
}: FilterBuilderProps) {
  const [filter, setFilter] = useState<FilterGroup>(
    initialFilter || {
      id: generateId(),
      operator: "AND",
      conditions: [],
    }
  )
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const updateFilter = (newFilter: FilterGroup) => {
    setFilter(newFilter)
    onChange?.(newFilter)
  }

  const addCondition = (groupId: string) => {
    const addToGroup = (group: FilterGroup): FilterGroup => {
      if (group.id === groupId) {
        return {
          ...group,
          conditions: [
            ...group.conditions,
            {
              id: generateId(),
              field: schema[0]?.name || "",
              operator: "=",
              value: "",
            },
          ],
        }
      }
      return {
        ...group,
        conditions: group.conditions.map((c) =>
          isFilterGroup(c) ? addToGroup(c) : c
        ),
      }
    }
    updateFilter(addToGroup(filter))
  }

  const addGroup = (parentId: string) => {
    const addToParent = (group: FilterGroup): FilterGroup => {
      if (group.id === parentId) {
        const newGroup: FilterGroup = {
          id: generateId(),
          operator: "AND",
          conditions: [],
        }
        setExpandedGroups((prev) => new Set([...prev, newGroup.id]))
        return {
          ...group,
          conditions: [...group.conditions, newGroup],
        }
      }
      return {
        ...group,
        conditions: group.conditions.map((c) =>
          isFilterGroup(c) ? addToParent(c) : c
        ),
      }
    }
    updateFilter(addToParent(filter))
  }

  const removeCondition = (groupId: string, conditionId: string) => {
    const removeFromGroup = (group: FilterGroup): FilterGroup => {
      if (group.id === groupId) {
        return {
          ...group,
          conditions: group.conditions.filter((c) => c.id !== conditionId),
        }
      }
      return {
        ...group,
        conditions: group.conditions.map((c) =>
          isFilterGroup(c) ? removeFromGroup(c) : c
        ),
      }
    }
    updateFilter(removeFromGroup(filter))
  }

  const updateCondition = (
    groupId: string,
    conditionId: string,
    updates: Partial<FilterCondition>
  ) => {
    const updateInGroup = (group: FilterGroup): FilterGroup => {
      if (group.id === groupId) {
        return {
          ...group,
          conditions: group.conditions.map((c) => {
            if (c.id === conditionId && !isFilterGroup(c)) {
              return { ...c, ...updates } as FilterCondition
            }
            return c
          }),
        }
      }
      return {
        ...group,
        conditions: group.conditions.map((c) =>
          isFilterGroup(c) ? updateInGroup(c) : c
        ),
      }
    }
    updateFilter(updateInGroup(filter))
  }

  const toggleGroupOperator = (groupId: string) => {
    const toggleInGroup = (group: FilterGroup): FilterGroup => {
      if (group.id === groupId) {
        return {
          ...group,
          operator: group.operator === "AND" ? "OR" : "AND",
        }
      }
      return {
        ...group,
        conditions: group.conditions.map((c) =>
          isFilterGroup(c) ? toggleInGroup(c) : c
        ),
      }
    }
    updateFilter(toggleInGroup(filter))
  }

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  const getFieldSchema = (fieldName: string) => {
    return schema.find((f) => f.name === fieldName)
  }

  const renderCondition = (
    condition: FilterCondition,
    groupId: string,
    index: number,
    total: number
  ) => {
    const fieldSchema = getFieldSchema(condition.field)
    const showOperator = index < total - 1

    return (
      <div key={condition.id} className="flex items-center gap-2">
        <div className="flex-1 grid grid-cols-12 gap-2">
          <Select
            value={condition.field}
            onChange={(e) =>
              updateCondition(groupId, condition.id, { field: e.target.value })
            }
            className="col-span-3"
          >
            {schema.map((field) => (
              <option key={field.name} value={field.name}>
                {field.label}
              </option>
            ))}
          </Select>

          <Select
            value={condition.operator}
            onChange={(e) =>
              updateCondition(groupId, condition.id, {
                operator: e.target.value as ComparisonOperator,
              })
            }
            className="col-span-3"
          >
            {comparisonOperators.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </Select>

          <div className="col-span-5">
            {fieldSchema?.type === "select" && fieldSchema.options ? (
              <Select
                value={condition.value}
                onChange={(e) =>
                  updateCondition(groupId, condition.id, { value: e.target.value })
                }
              >
                <option value="">Select...</option>
                {fieldSchema.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            ) : fieldSchema?.type === "boolean" ? (
              <Select
                value={condition.value}
                onChange={(e) =>
                  updateCondition(groupId, condition.id, { value: e.target.value })
                }
              >
                <option value="">Select...</option>
                <option value="true">True</option>
                <option value="false">False</option>
              </Select>
            ) : (
              <Input
                type={fieldSchema?.type === "number" ? "number" : fieldSchema?.type === "date" ? "date" : "text"}
                value={condition.value}
                placeholder="Value..."
                onChange={(e) =>
                  updateCondition(groupId, condition.id, { value: e.target.value })
                }
              />
            )}
          </div>

          <div className="col-span-1 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeCondition(groupId, condition.id)}
              className="px-2 py-1 min-w-auto"
            >
              <FiTrash2 />
            </Button>
          </div>
        </div>

        {showOperator && (
          <div className="flex items-center gap-1 px-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {filter.operator}
            </span>
          </div>
        )}
      </div>
    )
  }

  const renderGroup = (group: FilterGroup, depth = 0): React.ReactNode => {
    const isExpanded = expandedGroups.has(group.id)
    const hasNestedGroups = group.conditions.some(isFilterGroup)
    const paddingLeft = depth * 16

    return (
      <div
        key={group.id}
        className="border-l-2 border-border/50 pl-4"
        style={{ paddingLeft: `${paddingLeft + 16}px` }}
      >
        <div className="flex items-center gap-2 mb-2">
          {hasNestedGroups && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleGroupExpansion(group.id)}
              className="px-2 py-1 min-w-auto"
            >
              {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => toggleGroupOperator(group.id)}
            className="px-3 py-1 min-w-auto font-mono"
          >
            {group.operator}
          </Button>

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => addCondition(group.id)}
            className="px-2 py-1 min-w-auto"
          >
            <FiPlus />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => addGroup(group.id)}
            className="px-2 py-1 min-w-auto"
          >
            <FiPlus />
            <span className="text-xs">()</span>
          </Button>

          {depth > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeCondition(filter.id, group.id)}
              className="px-2 py-1 min-w-auto"
            >
              <FiTrash2 />
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {group.conditions.map((condition, index) => {
            if (isFilterGroup(condition)) {
              return isExpanded ? renderGroup(condition, depth + 1) : null
            }
            return renderCondition(
              condition,
              group.id,
              index,
              group.conditions.length
            )
          })}
        </div>

        {group.conditions.length === 0 && (
          <div className="text-sm text-muted-foreground py-2 italic">
            No conditions. Add a condition or group to get started.
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`${filterBuilderVariants({ size })} ${className ?? ""}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Filter Builder</h3>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => addCondition(filter.id)}
          >
            <FiPlus />
            Add Condition
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => addGroup(filter.id)}
          >
            <FiPlus />
            Add Group
          </Button>
        </div>
      </div>

      {renderGroup(filter)}
    </div>
  )
}

// Helper functions
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function isFilterGroup(item: FilterCondition | FilterGroup): item is FilterGroup {
  return "operator" in item && "conditions" in item
}
