import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    id: 1,
    user: {
      name: "Admin",
      avatar: "/placeholder-user.jpg",
      initials: "AD",
    },
    action: "updated",
    target: "DHL Express",
    targetType: "service",
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    user: {
      name: "Admin",
      avatar: "/placeholder-user.jpg",
      initials: "AD",
    },
    action: "created",
    target: "GLS Economy",
    targetType: "service",
    timestamp: "3 hours ago",
  },
  {
    id: 3,
    user: {
      name: "Admin",
      avatar: "/placeholder-user.jpg",
      initials: "AD",
    },
    action: "updated",
    target: "BRT",
    targetType: "carrier",
    timestamp: "5 hours ago",
  },
  {
    id: 4,
    user: {
      name: "Admin",
      avatar: "/placeholder-user.jpg",
      initials: "AD",
    },
    action: "deleted",
    target: "Old Rate",
    targetType: "rate",
    timestamp: "1 day ago",
  },
  {
    id: 5,
    user: {
      name: "Admin",
      avatar: "/placeholder-user.jpg",
      initials: "AD",
    },
    action: "created",
    target: "InPost",
    targetType: "carrier",
    timestamp: "2 days ago",
  },
]

export function RecentActivityList() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center gap-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
            <AvatarFallback>{activity.user.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.user.name} <span className="text-muted-foreground">{activity.action}</span> {activity.target}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {activity.targetType}
              </Badge>
              <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

