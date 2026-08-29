import Typography from './Typography'
import Image from './Image'

type ActivityLogProps =  {
    user: string
    action: string
    object: string
    when?: string
    avatar?: string
    className?: string
}

import { FiGitMerge, FiHeart, FiGitBranch, FiActivity, FiPlus, FiUser } from "react-icons/fi"


// for now, we will support only a few actions
// we will use a switch to find the correct icon for the given action and use a default fallback
enum ActivityType {
  Forked = "forked",
  Liked = "liked",
  Branched = "branched",
  ContributedTo = "contributed to",
  Created = "created",
}

export function getIcon(action: string | ActivityType){
    switch(action){
        case 'forked':
            return <FiGitMerge />;
        case 'liked':
            return <FiHeart />;
        case 'branched':
            return <FiGitBranch />;
        case 'contributed to':
            return <FiActivity />;
        case 'created':
            return <FiPlus />;
        default:
            return <FiActivity/>;
    }
}

export default function ActivityLog({ user, action, object, when, avatar, className }: ActivityLogProps) {
    return (
        <div className={`flex items-start gap-3 p-3 rounded-lg hover:bg-foreground/5 transition-colors ${className ?? ""}`}>
            {avatar ? (
                <Image 
                    src={avatar} 
                    alt={user} 
                    variant="pfp" 
                    size="sm"
                    className="shrink-0"
                />
            ) : (
                <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                    <FiUser className="text-foreground/50 text-sm" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <Typography variant="p" className="leading-snug">
                    <span className="font-semibold">{user}</span> {action} <span className="font-semibold">{object}</span>
                </Typography>
                {when && (
                    <Typography variant="small" className="text-muted-foreground mt-1">
                        {when}
                    </Typography>
                )}
            </div>
        </div>
    )
}