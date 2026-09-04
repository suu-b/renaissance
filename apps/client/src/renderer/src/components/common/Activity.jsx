import React, { useState } from "react"
import pfp from "../../assets/pfp.jpeg"
import ActivityLog, { getIcon } from "../ui/ActivityLog"
import Button from "../ui/Button"
import Typography from "../ui/Typography"

// Dummy data with avatars and dates
const activities = [
  { id: 1, user: "Shubham", action: "created", object: "Project 1", when: "4 hrs ago", dateGroup: "Today", avatar: pfp },
  { id: 2, user: "Diana", action: "contributed to", object: "Project 5", when: "5 hrs ago", dateGroup: "Today" },
  { id: 3, user: "Alice", action: "liked", object: "Project 2", when: "2 days ago", dateGroup: "Yesterday" },
  { id: 4, user: "Charlie", action: "branched", object: "Project 4", when: "3 days ago", dateGroup: "Yesterday" },
  { id: 5, user: "Bob", action: "forked", object: "Project 3", when: "1 week ago", dateGroup: "This Week" },
]

const activityTypes = ["All", "created", "liked", "forked", "branched", "contributed to"]

export default function Activity() {
  const [showMine, setShowMine] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("All")
  const currentUser = "Shubham"

  const filteredActivities = activities.filter(activity => {
    const matchesMine = !showMine || activity.user === currentUser
    const matchesFilter = selectedFilter === "All" || activity.action === selectedFilter
    return matchesMine && matchesFilter
  })

  // Group by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    if (!groups[activity.dateGroup]) {
      groups[activity.dateGroup] = []
    }
    groups[activity.dateGroup].push(activity)
    return groups
  }, {})

  return (
    <div className="border border-foreground/20 rounded-lg p-4 max-h-full flex flex-col">
      {/* Header with Mine button */}
      <div className="flex justify-between items-center mb-3">
        <Typography variant="h3">Activity</Typography>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowMine(!showMine)}
          className={showMine ? "bg-foreground/10" : ""}
        >
          Mine!?
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {activityTypes.map(type => (
          <button
            key={type}
            onClick={() => setSelectedFilter(type)}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium group ${
              selectedFilter === type
                ? "bg-foreground text-background"
                : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
            }`}
          >
            {type !== "All" && (
              <span className={`text-foreground/70 group-hover:text-foreground/40 ${
                selectedFilter === type ? "text-white" : ""
              }`}>
                {getIcon(type)}
              </span>
            )}
            {type}
          </button>
        ))}
      </div>

      {/* Activity logs grouped by date */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedActivities).map(([dateGroup, groupActivities]) => (
          <div key={dateGroup} className="mb-3">
            <Typography variant="small" className="text-muted-foreground font-semibold mb-2 uppercase tracking-wider">
              {dateGroup}
            </Typography>
            <div className="flex flex-col gap-2">
              {groupActivities.map(activity => (
                <ActivityLog 
                  key={activity.id}
                  user={activity.user} 
                  action={activity.action} 
                  object={activity.object} 
                  when={activity.when}
                  avatar={activity.avatar}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredActivities.length === 0 && (
          <Typography variant="p" className="text-muted-foreground text-center py-4">
            No activities found
          </Typography>
        )}
      </div>
    </div>
  )
}
