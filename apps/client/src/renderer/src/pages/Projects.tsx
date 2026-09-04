import React, { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import Page from "../components/layout/Page"
import ProjectList, { staticProjects } from "../components/common/ProjectList"
import FilterBuilder, { SchemaField, FilterGroup, FilterCondition, isFilterGroup } from "../components/ui/FilterBuilder"
import Button from "../components/ui/Button"
import { FiFilter, FiX } from "react-icons/fi"

const projectSchema: SchemaField[] = [
  { name: "title", label: "Title", type: "text" },
  { name: "subtitle", label: "Description", type: "text" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "archived", label: "Archived" },
  ]},
  { name: "priority", label: "Priority", type: "number" },
  { name: "createdDate", label: "Created Date", type: "date" },
  { name: "lastUpdatedBy", label: "Last Updated By", type: "text" },
]

export default function Projects(): React.JSX.Element {
    const [searchParams, setSearchParams] = useSearchParams()
    const [showFilter, setShowFilter] = useState(false)
    const [filter, setFilter] = useState<FilterGroup | undefined>()
    const [isInternalUpdate, setIsInternalUpdate] = useState(false)

    // Parse filter from URL params on mount and when URL changes (external navigation)
    useEffect(() => {
        if (isInternalUpdate) {
            setIsInternalUpdate(false)
            return
        }

        const filterParam = searchParams.get('filter')
        if (filterParam) {
            try {
                const parsedFilter = JSON.parse(decodeURIComponent(filterParam))
                setFilter(parsedFilter)
                setShowFilter(true) // Auto-open filter panel when filter is present
            } catch (e) {
                console.error('Failed to parse filter from URL:', e)
            }
        } else {
            setFilter(undefined)
        }
    }, [searchParams, isInternalUpdate])

    // Update URL when filter changes (internal state changes)
    const handleFilterChange = (newFilter: FilterGroup | undefined) => {
        setFilter(newFilter)
        setIsInternalUpdate(true)
        
        const newParams = new URLSearchParams(searchParams)
        
        if (newFilter && newFilter.conditions.length > 0) {
            const filterString = encodeURIComponent(JSON.stringify(newFilter))
            newParams.set('filter', filterString)
        } else {
            newParams.delete('filter')
        }
        
        setSearchParams(newParams, { replace: true })
    }

    const filteredProjects = useMemo(() => {
        if (!filter || filter.conditions.length === 0) {
            return staticProjects
        }

        return staticProjects.filter((project) => {
            return evaluateFilter(project, filter)
        })
    }, [filter])

    const evaluateFilter = (project: any, filterGroup: FilterGroup): boolean => {
        const results = filterGroup.conditions.map((condition) => {
            if (isFilterGroup(condition)) {
                return evaluateFilter(project, condition)
            }
            return evaluateCondition(project, condition)
        })

        if (filterGroup.operator === "AND") {
            return results.every((result) => result === true)
        } else {
            return results.some((result) => result === true)
        }
    }

    const evaluateCondition = (project: any, condition: FilterCondition): boolean => {
        const fieldValue = project[condition.field]
        const conditionValue = condition.value

        switch (condition.operator) {
            case "=":
                return String(fieldValue) === String(conditionValue)
            case "!=":
                return String(fieldValue) !== String(conditionValue)
            case ">":
                return Number(fieldValue) > Number(conditionValue)
            case "<":
                return Number(fieldValue) < Number(conditionValue)
            case ">=":
                return Number(fieldValue) >= Number(conditionValue)
            case "<=":
                return Number(fieldValue) <= Number(conditionValue)
            case "contains":
                return String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase())
            case "starts with":
                return String(fieldValue).toLowerCase().startsWith(String(conditionValue).toLowerCase())
            case "ends with":
                return String(fieldValue).toLowerCase().endsWith(String(conditionValue).toLowerCase())
            case "in":
                return String(conditionValue).split(',').map(v => v.trim()).includes(String(fieldValue))
            case "not in":
                return !String(conditionValue).split(',').map(v => v.trim()).includes(String(fieldValue))
            default:
                return false
        }
    }

    const clearFilter = () => {
        handleFilterChange(undefined)
    }

    const toggleShowFilter = () => {
        setShowFilter(!showFilter)
    }

    const activeFilterCount = filter?.conditions.length || 0

    return (
        <Page alignment="default">
            <div className="flex gap-4">
                {/* Sidebar with Filter */}
                <div className={`transition-all duration-300 ${showFilter ? 'w-80' : 'w-0 overflow-hidden'}`}>
                    {showFilter && (
                        <div className="w-80 p-4 border-r border-border/50">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Filters</h2>
                                <Button variant="ghost" size="sm" onClick={() => setShowFilter(false)}>
                                    <FiX />
                                </Button>
                            </div>
                            <FilterBuilder
                                schema={projectSchema}
                                onChange={handleFilterChange}
                                initialFilter={filter}
                                size="sm"
                            />
                            {activeFilterCount > 0 && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={clearFilter}
                                    className="w-full mt-4"
                                >
                                    Clear Filters ({activeFilterCount})
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Main content */}
                <div className="flex-1">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant={showFilter ? "primary" : "secondary"}
                                size="sm"
                                onClick={toggleShowFilter}
                            >
                                <FiFilter />
                                {showFilter ? "Hide Filters" : "Show Filters"}
                            </Button>
                            {activeFilterCount > 0 && !showFilter && (
                                <span className="text-sm text-muted-foreground">
                                    {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Showing {filteredProjects.length} of {staticProjects.length} projects
                        </div>
                    </div>

                    <ProjectList 
                        size="md" 
                        itemsPerPage={10} 
                        projects={filteredProjects}
                    />
                </div>
            </div>
        </Page>
    )
}
