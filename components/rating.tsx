import { Star } from "lucide-react"

const getLevel = (rating: number) => {
    if (rating < 1.5) return { title: "Бронзовый исполнитель", bg: "bg-warning/20", icon: "text-warning-600" }
    if (rating < 3.5) return { title: "Серебряный исполнитель", bg: "bg-surface-3", icon: "text-content-secondary" }
    if (rating < 4.5) return { title: "Золотой исполнитель", bg: "bg-warning/15", icon: "text-warning" }
    return { title: "Платиновый исполнитель", bg: "bg-info/15", icon: "text-info" }
}

export default function PerformerCard({ myRating }: { myRating: number }) {
    const level = getLevel(myRating)

    return (
        <div className="text-center mb-6">
            <div className={`w-20 h-20 ${level.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Star className={`w-10 h-10 ${level.icon}`} />
            </div>
            <h3 className="text-xl font-bold text-foreground">{level.title}</h3>
            <p className="text-sm text-content-secondary">Рейтинг: {myRating}/5</p>
        </div>
    )
}
