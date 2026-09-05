import React, { useMemo } from "react"
// import { useSearchParams } from "react-router-dom" // Commented out since filter UI is disabled
import Page from "../components/layout/Page"
import ProjectList, { staticProjects } from "../components/common/ProjectList"
// import FilterBuilder, { SchemaField, FilterGroup, FilterCondition, isFilterGroup } from "../components/ui/FilterBuilder" // Commented out since filter UI is disabled
// import Button from "../components/ui/Button" // Commented out since filter UI is disabled
import Typography from "../components/ui/Typography"
// import { FiFilter, FiX, FiStar } from "react-icons/fi" // Commented out since filter UI is disabled

// Current user - in a real app this would come from auth context
const CURRENT_USER = "Shubham"

// Schema definitions - commented out since filter UI is disabled
// const allProjectsSchema: SchemaField[] = [
//   { name: "title", label: "Title", type: "text" },
//   { name: "subtitle", label: "Description", type: "text" },
//   { name: "status", label: "Status", type: "select", options: [
//     { value: "active", label: "Active" },
//     { value: "inactive", label: "Inactive" },
//     { value: "archived", label: "Archived" },
//   ]},
//   { name: "priority", label: "Priority", type: "number" },
//   { name: "createdDate", label: "Created Date", type: "date" },
//   { name: "lastUpdatedBy", label: "Last Updated By", type: "text" },
//   { name: "owner", label: "Owner", type: "text" },
// ]

// const myProjectsSchema: SchemaField[] = [
//   { name: "title", label: "Title", type: "text" },
//   { name: "subtitle", label: "Description", type: "text" },
//   { name: "status", label: "Status", type: "select", options: [
//     { value: "active", label: "Active" },
//     { value: "inactive", label: "Inactive" },
//     { value: "archived", label: "Archived" },
//   ]},
//   { name: "priority", label: "Priority", type: "number" },
//   { name: "createdDate", label: "Created Date", type: "date" },
//   { name: "lastUpdatedBy", label: "Last Updated By", type: "text" },
// ]

type ProjectsProps = {
  mine?: boolean
}

export default function Projects({ mine = false }: ProjectsProps): React.JSX.Element {
    // Filter-related state and functions - commented out since filter UI is disabled
    // const [searchParams, setSearchParams] = useSearchParams()
    // const [showFilter, setShowFilter] = useState(false)
    // const [filter, setFilter] = useState<FilterGroup | undefined>()
    // const [isInternalUpdate, setIsInternalUpdate] = useState(false)
    
    // // Use appropriate schema based on whether we're viewing "mine" or "all" projects
    // const currentSchema = mine ? myProjectsSchema : allProjectsSchema

    // // Parse filter from URL params on mount and when URL changes (external navigation)
    // useEffect(() => {
    //     if (isInternalUpdate) {
    //         setIsInternalUpdate(false)
    //         return
    //     }

    //     const filterParam = searchParams.get('filter')
    //     if (filterParam) {
    //         try {
    //             const parsedFilter = JSON.parse(decodeURIComponent(filterParam))
    //             setFilter(parsedFilter)
    //             setShowFilter(true) // Auto-open filter panel when filter is present
    //         } catch (e) {
    //             console.error('Failed to parse filter from URL:', e)
    //         }
    //     } else {
    //         setFilter(undefined)
    //     }
    // }, [searchParams, isInternalUpdate])

    // // Update URL when filter changes (internal state changes)
    // const handleFilterChange = (newFilter: FilterGroup | undefined) => {
    //     setFilter(newFilter)
    //     setIsInternalUpdate(true)
        
    //     const newParams = new URLSearchParams(searchParams)
        
    //     if (newFilter && newFilter.conditions.length > 0) {
    //         const filterString = encodeURIComponent(JSON.stringify(newFilter))
    //         newParams.set('filter', filterString)
    //     } else {
    //         newParams.delete('filter')
    //     }
        
    //     setSearchParams(newParams, { replace: true })
    // }

    // const evaluateFilter = (project: any, filterGroup: FilterGroup): boolean => {
    //     const results = filterGroup.conditions.map((condition) => {
    //         if (isFilterGroup(condition)) {
    //             return evaluateFilter(project, condition)
    //         }
    //         return evaluateCondition(project, condition)
    //     })

    //     if (filterGroup.operator === "AND") {
    //         return results.every((result) => result === true)
    //     } else {
    //         return results.some((result) => result === true)
    //     }
    // }

    // const evaluateCondition = (project: any, condition: FilterCondition): boolean => {
    //     const fieldValue = project[condition.field]
    //     const conditionValue = condition.value

    //     switch (condition.operator) {
    //         case "=":
    //             return String(fieldValue) === String(conditionValue)
    //         case "!=":
    //             return String(fieldValue) !== String(conditionValue)
    //         case ">":
    //             return Number(fieldValue) > Number(conditionValue)
    //         case "<":
    //             return Number(fieldValue) < Number(conditionValue)
    //         case ">=":
    //             return Number(fieldValue) >= Number(conditionValue)
    //         case "<=":
    //             return Number(fieldValue) <= Number(conditionValue)
    //         case "contains":
    //             return String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase())
    //         case "starts with":
    //             return String(fieldValue).toLowerCase().startsWith(String(conditionValue).toLowerCase())
    //         case "ends with":
    //             return String(fieldValue).toLowerCase().endsWith(String(conditionValue).toLowerCase())
    //         case "in":
    //             return String(conditionValue).split(',').map(v => v.trim()).includes(String(fieldValue))
    //         case "not in":
    //             return !String(conditionValue).split(',').map(v => v.trim()).includes(String(fieldValue))
    //         default:
    //             return false
    //     }
    // }

    const filteredProjects = useMemo(() => {
        let projects = staticProjects

        // Apply "mine" filter if the prop is set
        if (mine) {
            projects = projects.filter((project) => project.owner === CURRENT_USER)
        }

        // Apply custom filter if present - commented out since filter UI is disabled
        // if (filter && filter.conditions.length > 0) {
        //     projects = projects.filter((project) => {
        //         return evaluateFilter(project, filter)
        //     })
        // }

        return projects
    }, [mine])

    // const clearFilter = () => {
    //     handleFilterChange(undefined)
    //     // Don't reset the mine filter - that's controlled by the route
    // }

    // const handleQuickFilter = (field: string, value: string) => {
    //     const quickFilter: FilterGroup = {
    //         id: 'quick-filter',
    //         operator: 'AND',
    //         conditions: [
    //             {
    //                 id: 'quick-condition',
    //                 field,
    //                 operator: '=',
    //                 value
    //             }
    //         ]
    //     }
    //     handleFilterChange(quickFilter)
    // }

    const pageTitle = mine ? "My Projects" : "All Projects"
    const pageDescription = mine 
        ? `Projects owned by ${CURRENT_USER}` 
        : "All projects in the workspace"
    
    const totalProjects = mine 
        ? staticProjects.filter(p => p.owner === CURRENT_USER).length 
        : staticProjects.length

    return (
        <Page alignment="default">
            <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="mb-6">
                    <Typography variant="h1" className="mb-2">{pageTitle}</Typography>
                    <Typography variant="muted">{pageDescription}</Typography>
                </div>

                {/* Main content */}
                <div className="flex-1">
                    <ProjectList 
                        size="md" 
                        itemsPerPage={10} 
                        projects={filteredProjects}
                    />
                    <div className="text-sm text-muted-foreground mt-4">
                        Showing {filteredProjects.length} of {totalProjects} projects
                    </div>
                </div>
            </div>
        </Page>
    )
}
