"use client"

import {
    ChevronDown,
    ChevronLeft,
    Loader2,
    Trash2,
    Plus,
    UserPlus,
    Building2,
    DoorOpen,
    Search,
    Users,
    Settings2,
    Home,
    MapPin,
} from "lucide-react"
import { getSmartHomeDeviceIcon } from "@/lib/yandex-smart-home-utils"
import { useSmartHomeManagement } from "@/hooks/use-smart-home-management"

interface SmartHomeManagementProps {
    /** Тёмная тема (для раздела Управление на десктопе у админа) */
    dark?: boolean
}

export function SmartHomeManagement({ dark = false }: SmartHomeManagementProps) {
    const {
        step,
        offices,
        selectedOffice,
        rooms,
        selectedRoom,
        roomLinkedDevices,
        roomSubscriptions,
        loadingOffices,
        loadingRooms,
        loadingDevices,
        loadingSubscriptions,
        isControlling,
        isDeletingDevice,
        isDeletingSub,
        isAddingDevice,
        isAddingEmployee,
        devicesExpanded,
        setDevicesExpanded,
        accessExpanded,
        setAccessExpanded,
        showAddDevice,
        setShowAddDevice,
        showAddEmployee,
        setShowAddEmployee,
        selectedNewDevice,
        setSelectedNewDevice,
        selectedNewEmployee,
        setSelectedNewEmployee,
        employeeFilter,
        setEmployeeFilter,
        handleSelectOffice,
        handleSelectRoom,
        handleBackToOffices,
        getDeviceState,
        handleToggleDevice,
        handleAddDevice,
        handleDeleteDevice,
        handleAddEmployee,
        handleDeleteSubscription,
        getAvailableDevices,
        getAvailableEmployees,
        findYandexDevice,
    } = useSmartHomeManagement()

    const d = dark
    const cardBg = d ? "bg-surface-2" : "bg-white"
    const cardBorder = d ? "border-hairline" : "border-hairline"
    const cardHover = d ? "hover:bg-surface-3 hover:border-brand/30" : "hover:border-info/40 hover:bg-info/10/50"
    const titleCl = d ? "text-white" : "text-foreground"
    const mutedCl = d ? "text-white/60" : "text-content-tertiary"
    const iconBg = d ? "bg-brand/20" : "bg-info/10"
    const iconCl = d ? "text-brand" : "text-info"
    const sidebarBg = d ? "bg-surface-2" : "bg-card"
    const sidebarHeadBg = d ? "bg-surface-1 border-hairline" : "bg-surface-3 border-hairline"
    const sidebarHeadText = d ? "text-white/80" : "text-content-secondary"
    const roomItemSelected = d ? "bg-brand/20 border-l-brand" : "bg-info/10 border-l-info"
    const roomItemHover = d ? "hover:bg-white/5" : "hover:bg-surface-3"
    const roomItemText = d ? "text-white/90" : "text-content-secondary"
    const roomItemTextSelected = d ? "text-brand" : "text-info-600"
    const rowBg = d ? "bg-surface-1 border-hairline" : "bg-surface-3 border-hairline"
    const rowText = d ? "text-white/90" : "text-foreground"
    const addFormBg = d ? "bg-brand/10 border-brand/30" : "bg-info/10 border-info/30"
    const addFormText = d ? "text-brand" : "text-info-600"
    const addFormInput = d ? "bg-surface-1 border-hairline text-white focus:border-brand" : "border-info/30 bg-card focus:border-info-400"
    const addFormGreenBg = d ? "bg-success/10 border-success/30" : "bg-success/10 border-success/30"
    const addFormGreenText = d ? "text-success-300" : "text-success-600"
    const addFormGreenInput = d ? "bg-surface-1 border-hairline text-white focus:border-success-400" : "border-success/30 bg-card focus:border-success-400"
    const btnPrimary = d ? "bg-brand-fill hover:bg-brand/90 text-white" : "bg-info hover:bg-info-600 text-white"
    const btnGreen = d ? "bg-success hover:bg-success-600 text-white" : "bg-success hover:bg-success-600 text-white"
    const btnCancel = d ? "text-white/70 hover:bg-white/10" : "text-content-secondary hover:bg-surface-3"
    const btnGhost = d ? "hover:bg-white/10" : "hover:bg-surface-3"
    const btnRemove = d ? "border-hairline-strong text-white/80 hover:bg-danger/20 hover:text-danger-400" : "text-content-secondary bg-card border-hairline hover:bg-danger/10 hover:text-danger hover:border-danger/30"
    const emptyCl = d ? "text-white/50" : "text-content-tertiary"
    const loaderCl = d ? "text-white/50" : "text-content-tertiary"
    const userAvatarBg = d ? "bg-white/10" : "bg-surface-3"
    const userAvatarIcon = d ? "text-white/60" : "text-content-tertiary"
    const accessLabel = d ? "text-success-400" : "text-success"

    // ============================================================
    // RENDER: Step 1 – Office Selection
    // ============================================================
    if (step === "offices") {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${iconBg}`}>
                        <Home className={`w-5 h-5 ${iconCl}`} />
                    </div>
                    <div>
                        <h2 className={`text-lg font-semibold ${titleCl}`}>Управление умным домом</h2>
                        <p className={`text-sm ${mutedCl}`}>Выберите офис для управления устройствами</p>
                    </div>
                </div>

                {loadingOffices ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className={`w-6 h-6 animate-spin ${loaderCl}`} />
                        <span className={`ml-2 text-sm ${mutedCl}`}>Загрузка офисов...</span>
                    </div>
                ) : offices.length === 0 ? (
                    <div className={`text-center py-12 text-sm ${mutedCl}`}>
                        Нет доступных офисов
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {offices.map((office) => (
                            <button
                                key={office.id}
                                onClick={() => handleSelectOffice(office)}
                                className={`flex items-center gap-4 p-4 border rounded-xl transition-all text-left group ${cardBg} ${cardBorder} ${cardHover}`}
                            >
                                <div className={`p-3 rounded-xl transition-colors ${d ? "bg-white/10 group-hover:bg-brand/20" : "bg-surface-3 group-hover:bg-info/15"}`}>
                                    <Building2 className={`w-6 h-6 transition-colors ${d ? "text-white/80 group-hover:text-brand" : "text-content-secondary group-hover:text-info"}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium truncate ${titleCl}`}>{office.name}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <MapPin className={`w-3 h-3 flex-shrink-0 ${mutedCl}`} />
                                        <p className={`text-xs truncate ${mutedCl}`}>{office.address}, {office.city}</p>
                                    </div>
                                </div>
                                <ChevronDown className={`w-4 h-4 -rotate-90 transition-colors ${d ? "text-white/50 group-hover:text-brand" : "text-content-tertiary group-hover:text-info"}`} />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    // ============================================================
    // RENDER: Step 2 – Cabinets/Rooms List + Detail Panel
    // ============================================================
    return (
        <div className="space-y-0">
            {/* Back button + office header */}
            <div className="flex items-center gap-3 mb-4">
                <button
                    onClick={handleBackToOffices}
                    className={`p-2 rounded-lg transition-colors ${btnGhost}`}
                >
                    <ChevronLeft className={`w-5 h-5 ${d ? "text-white/80" : "text-content-secondary"}`} />
                </button>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${iconBg}`}>
                        <Building2 className={`w-5 h-5 ${iconCl}`} />
                    </div>
                    <div>
                        <h2 className={`text-lg font-semibold ${titleCl}`}>{selectedOffice?.name}</h2>
                        <p className={`text-sm ${mutedCl}`}>Кабинеты и переговорные комнаты</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                {/* Sidebar – Room List */}
                <div className="lg:w-64 flex-shrink-0">
                    <div className={`${sidebarBg} border ${cardBorder} rounded-xl overflow-hidden`}>
                        <div className={`px-4 py-3 border-b ${sidebarHeadBg}`}>
                            <h3 className={`text-sm font-semibold ${sidebarHeadText}`}>Кабинеты</h3>
                        </div>

                        {loadingRooms ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className={`w-5 h-5 animate-spin ${loaderCl}`} />
                            </div>
                        ) : rooms.length === 0 ? (
                            <div className={`p-4 text-center text-sm ${mutedCl}`}>
                                Нет кабинетов в этом офисе
                            </div>
                        ) : (
                            <div className="max-h-[500px] overflow-y-auto">
                                {rooms.map((room) => {
                                    const isSelected = selectedRoom?.id === room.id
                                    return (
                                        <button
                                            key={room.id}
                                            onClick={() => handleSelectRoom(room)}
                                            className={`w-full text-left px-4 py-3 border-b last:border-b-0 flex items-center gap-3 transition-colors ${
                                                d ? "border-white/5" : "border-hairline"
                                            } ${isSelected ? `${roomItemSelected} border-l-[3px]` : `${roomItemHover} border-l-[3px] border-l-transparent`}`}
                                        >
                                            <DoorOpen
                                                className={`w-4 h-4 flex-shrink-0 ${
                                                    isSelected ? iconCl : loaderCl
                                                }`}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className={`text-sm font-medium truncate ${
                                                        isSelected ? roomItemTextSelected : roomItemText
                                                    }`}
                                                >
                                                    {room.name}
                                                </p>
                                                <p className={`text-[11px] ${emptyCl}`}>
                                                    Этаж {room.floor}
                                                    {room.capacity ? ` • до ${room.capacity} чел.` : ""}
                                                </p>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content – Room Detail */}
                <div className="flex-1 min-w-0">
                    {!selectedRoom ? (
                        <div className={`${cardBg} border ${cardBorder} rounded-xl flex items-center justify-center py-16`}>
                            <div className="text-center">
                                <Settings2 className={`w-12 h-12 mx-auto mb-3 ${emptyCl}`} />
                                <p className={`${mutedCl} text-sm`}>Выберите кабинет для управления</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Room Header */}
                            <div className={`${cardBg} border ${cardBorder} rounded-xl px-5 py-4`}>
                                <h3 className={`text-base font-bold ${titleCl}`}>
                                    {selectedRoom.name}{" "}
                                    <span className={`font-normal ${mutedCl}`}>({selectedOffice?.name})</span>
                                </h3>
                                <p className={`text-sm ${mutedCl} mt-0.5`}>
                                    Офис: {selectedOffice?.name} &bull; Этаж: {selectedRoom.floor}-й
                                </p>
                            </div>

                            {/* ===== Devices Section ===== */}
                            <div className={`${cardBg} border ${cardBorder} rounded-xl overflow-hidden`}>
                                <button
                                    onClick={() => setDevicesExpanded(!devicesExpanded)}
                                    className={`w-full px-5 py-4 flex items-center justify-between transition-colors ${btnGhost}`}
                                >
                                    <h4 className={`text-sm font-semibold ${rowText}`}>Устройства в кабинете</h4>
                                    <ChevronDown
                                        className={`w-5 h-5 transition-transform ${loaderCl} ${
                                            devicesExpanded ? "" : "-rotate-90"
                                        }`}
                                    />
                                </button>

                                {devicesExpanded && (
                                    <div className="px-5 pb-4">
                                        {loadingDevices ? (
                                            <div className="flex items-center justify-center py-6">
                                                <Loader2 className={`w-5 h-5 animate-spin ${loaderCl}`} />
                                                <span className={`ml-2 text-sm ${mutedCl}`}>Загрузка устройств...</span>
                                            </div>
                                        ) : roomLinkedDevices.length === 0 && !showAddDevice ? (
                                            <p className={`text-sm py-3 ${emptyCl}`}>Нет устройств в этом кабинете</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {roomLinkedDevices.map((rd) => {
                                                    const yDevice = findYandexDevice(rd.device_id)
                                                    const isOn = yDevice ? getDeviceState(yDevice) : null
                                                    const isControllingThis = isControlling === rd.device_id
                                                    const isDeletingThis = isDeletingDevice === rd.id
                                                    const DeviceIcon = getSmartHomeDeviceIcon(rd.device_type, rd.device_name)

                                                    return (
                                                        <div
                                                            key={rd.id}
                                                            className={`flex items-center justify-between py-3 px-3 rounded-lg border ${rowBg}`}
                                                        >
                                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                <DeviceIcon
                                                                    className={`w-5 h-5 flex-shrink-0 ${
                                                                        isOn ? "text-warning" : loaderCl
                                                                    }`}
                                                                />
                                                                <span className={`text-sm font-medium truncate ${rowText}`}>
                                                                    {rd.device_name}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                {yDevice && isOn !== null && (
                                                                    <button
                                                                        onClick={() => handleToggleDevice(yDevice)}
                                                                        disabled={isControllingThis}
                                                                        className={`relative w-12 h-6 rounded-full transition-colors ${
                                                                            isOn ? (d ? "bg-brand" : "bg-info") : (d ? "bg-white/20" : "bg-surface-3")
                                                                        } ${isControllingThis ? "opacity-50" : ""}`}
                                                                    >
                                                                        {isControllingThis ? (
                                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                                                                            </div>
                                                                        ) : (
                                                                            <div
                                                                                className={`absolute top-0.5 w-5 h-5 bg-card rounded-full shadow transition-transform ${
                                                                                    isOn ? "translate-x-[26px]" : "translate-x-0.5"
                                                                                }`}
                                                                            />
                                                                        )}
                                                                    </button>
                                                                )}

                                                                <button
                                                                    onClick={() => handleDeleteDevice(rd)}
                                                                    disabled={isDeletingThis}
                                                                    className={`p-1.5 rounded-lg transition-colors ${btnGhost}`}
                                                                >
                                                                    {isDeletingThis ? (
                                                                        <Loader2 className={`w-4 h-4 animate-spin ${loaderCl}`} />
                                                                    ) : (
                                                                        <Trash2 className={`w-4 h-4 ${d ? "text-white/50 hover:text-danger-400" : "text-content-tertiary hover:text-danger"}`} />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        {showAddDevice ? (
                                            <div className={`mt-3 p-3 rounded-lg border space-y-3 ${addFormBg}`}>
                                                <p className={`text-sm font-medium ${addFormText}`}>Добавить устройство</p>
                                                <select
                                                    value={selectedNewDevice}
                                                    onChange={(e) => setSelectedNewDevice(e.target.value)}
                                                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none ${addFormInput}`}
                                                >
                                                    <option value="">Выберите устройство</option>
                                                    {getAvailableDevices().map((dev) => (
                                                        <option key={dev.id} value={dev.id}>
                                                            {dev.name} {dev.type ? `(${dev.type.replace("devices.types.", "")})` : ""}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleAddDevice}
                                                        disabled={!selectedNewDevice || isAddingDevice}
                                                        className={`flex-1 text-sm font-medium py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${btnPrimary}`}
                                                    >
                                                        {isAddingDevice ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Plus className="w-4 h-4" />
                                                        )}
                                                        Добавить
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setShowAddDevice(false)
                                                            setSelectedNewDevice("")
                                                        }}
                                                        className={`px-4 py-2 text-sm rounded-lg ${btnCancel}`}
                                                    >
                                                        Отмена
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setShowAddDevice(true)}
                                                className={`mt-3 w-full py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${btnPrimary}`}
                                            >
                                                <Plus className="w-4 h-4" />
                                                Добавить устройство
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ===== Employee Access Section ===== */}
                            <div className={`${cardBg} border ${cardBorder} rounded-xl overflow-hidden`}>
                                <button
                                    onClick={() => setAccessExpanded(!accessExpanded)}
                                    className={`w-full px-5 py-4 flex items-center justify-between transition-colors ${btnGhost}`}
                                >
                                    <h4 className={`text-sm font-semibold ${rowText}`}>Доступы сотрудников</h4>
                                    <ChevronDown
                                        className={`w-5 h-5 transition-transform ${loaderCl} ${
                                            accessExpanded ? "" : "-rotate-90"
                                        }`}
                                    />
                                </button>

                                {accessExpanded && (
                                    <div className="px-5 pb-4">
                                        {roomSubscriptions.length > 0 && (
                                            <div className="relative mb-3">
                                                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${loaderCl}`} />
                                                <input
                                                    type="text"
                                                    placeholder="Показать фильтру"
                                                    value={employeeFilter}
                                                    onChange={(e) => setEmployeeFilter(e.target.value)}
                                                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none ${d ? "bg-surface-1 border-hairline text-white placeholder:text-white/40 focus:border-brand" : "border-hairline bg-surface-3 focus:border-info-400"}`}
                                                />
                                            </div>
                                        )}

                                        {loadingSubscriptions ? (
                                            <div className="flex items-center justify-center py-6">
                                                <Loader2 className={`w-5 h-5 animate-spin ${loaderCl}`} />
                                                <span className={`ml-2 text-sm ${mutedCl}`}>Загрузка...</span>
                                            </div>
                                        ) : roomSubscriptions.length === 0 && !showAddEmployee ? (
                                            <p className={`text-sm py-3 ${emptyCl}`}>Нет сотрудников с доступом</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {roomSubscriptions
                                                    .filter((sub) => {
                                                        if (!employeeFilter.trim()) return true
                                                        const name = ((sub.subscribedClient || sub.client)?.full_name || "").toLowerCase()
                                                        return name.includes(employeeFilter.toLowerCase())
                                                    })
                                                    .map((sub) => {
                                                        const name = (sub.subscribedClient || sub.client)?.full_name || `Сотрудник ID: ${sub.client_id}`
                                                        const isDeletingThis = isDeletingSub === sub.id

                                                        return (
                                                            <div
                                                                key={sub.id}
                                                                className={`flex items-center justify-between py-3 px-3 rounded-lg border ${rowBg}`}
                                                            >
                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${userAvatarBg}`}>
                                                                        <Users className={`w-4 h-4 ${userAvatarIcon}`} />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className={`text-sm font-medium truncate ${rowText}`}>
                                                                            {name}
                                                                        </p>
                                                                        <p className={`text-[11px] ${accessLabel}`}>Доступ активен</p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleDeleteSubscription(sub)}
                                                                    disabled={isDeletingThis}
                                                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 border ${btnRemove}`}
                                                                >
                                                                    {isDeletingThis ? (
                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                    ) : (
                                                                        "Забрать доступ"
                                                                    )}
                                                                </button>
                                                            </div>
                                                        )
                                                    })}
                                            </div>
                                        )}

                                        {showAddEmployee ? (
                                            <div className={`mt-3 p-3 rounded-lg border space-y-3 ${addFormGreenBg}`}>
                                                <p className={`text-sm font-medium ${addFormGreenText}`}>Добавить сотрудника</p>
                                                <select
                                                    value={selectedNewEmployee === "" ? "" : selectedNewEmployee.toString()}
                                                    onChange={(e) =>
                                                        setSelectedNewEmployee(
                                                            e.target.value === "" ? "" : parseInt(e.target.value)
                                                        )
                                                    }
                                                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none ${addFormGreenInput}`}
                                                >
                                                    <option value="">Выберите сотрудника</option>
                                                    {getAvailableEmployees().map((u) => (
                                                        <option key={u.id} value={u.id}>
                                                            {u.full_name} ({u.phone})
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleAddEmployee}
                                                        disabled={!selectedNewEmployee || isAddingEmployee}
                                                        className={`flex-1 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${btnGreen}`}
                                                    >
                                                        {isAddingEmployee ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <UserPlus className="w-4 h-4" />
                                                        )}
                                                        Добавить
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setShowAddEmployee(false)
                                                            setSelectedNewEmployee("")
                                                        }}
                                                        className={`px-4 py-2 text-sm rounded-lg ${btnCancel}`}
                                                    >
                                                        Отмена
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setShowAddEmployee(true)}
                                                className={`mt-3 w-full py-2.5 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${btnGreen}`}
                                            >
                                                <Plus className="w-4 h-4" />
                                                Добавить сотрудника
                                            </button>
                                        )}

                                        {roomSubscriptions.length > 0 && (
                                            <p className={`mt-3 text-xs ${mutedCl}`}>
                                                Показаны {roomSubscriptions.length} из {roomSubscriptions.length} сотрудников
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
