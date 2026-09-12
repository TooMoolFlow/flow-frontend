"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Loader2, Power, Lightbulb, Home, Zap, Sparkles, Settings2 } from "lucide-react"
import { getClientRoomSubscriptions, getRoomDevicesForClient, controlDevice, type YandexDevice, type ControlDeviceRequest } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/stores/useAuthStore"

export function ClientSmartHomeControl() {
    const [isLoading, setIsLoading] = useState(false)
    const [isControlling, setIsControlling] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [subscriptions, setSubscriptions] = useState<any[]>([])
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
    const [devices, setDevices] = useState<YandexDevice[]>([])
    const { toast } = useToast()
    const user = useAuthStore(state => state.user)

    const loadSubscriptions = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            if (!user?.id) return
            const response = await getClientRoomSubscriptions(user.id)
            setSubscriptions(response.data.subscriptions || [])
            // Автоматически выбираем первую комнату, если есть подписки
            if (response.data.subscriptions && response.data.subscriptions.length > 0) {
                setSelectedRoomId(prev => prev || response.data.subscriptions[0].meeting_room_id)
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Ошибка при загрузке подписок")
        } finally {
            setIsLoading(false)
        }
    }, [user?.id])

    const loadDevices = useCallback(async () => {
        if (!selectedRoomId) return
        try {
            setIsLoading(true)
            setError(null)
            const response = await getRoomDevicesForClient(selectedRoomId)
            setDevices(response.data.devices || [])
        } catch (err: any) {
            setError(err.response?.data?.message || "Ошибка при загрузке устройств")
        } finally {
            setIsLoading(false)
        }
    }, [selectedRoomId])

    useEffect(() => {
        if (user?.id) {
            loadSubscriptions()
        }
    }, [user?.id, loadSubscriptions])

    useEffect(() => {
        if (selectedRoomId) {
            loadDevices()
        } else {
            setDevices([])
        }
    }, [selectedRoomId, loadDevices])

    const handleControlDevice = async (device: YandexDevice, actionType: string, value: any) => {
        try {
            setIsControlling(device.id)
            setError(null)

            const request: ControlDeviceRequest = {
                device_id: device.id,
                action_type: actionType,
                action_state: {
                    instance: "on",
                    value: value
                }
            }

            await controlDevice(request)

            toast({
                title: "Успешно",
                description: `Устройство "${device.name}" ${value ? "включено" : "выключено"}`,
                duration: 2000
            })

            // Обновляем состояние устройства локально
            setDevices(prevDevices =>
                prevDevices.map(d => {
                    if (d.id === device.id) {
                        const updatedDevice = { ...d }
                        const capability = updatedDevice.capabilities?.find(
                            (cap: any) => cap.type === actionType
                        )
                        if (capability) {
                            capability.state = { ...capability.state, value }
                        }
                        return updatedDevice
                    }
                    return d
                })
            )
        } catch (err: any) {
            setError(err.response?.data?.message || "Ошибка при управлении устройством")
        } finally {
            setIsControlling(null)
        }
    }

    // Получаем состояние устройства (включено/выключено)
    const getDeviceState = (device: YandexDevice, capabilityType: string): boolean | null => {
        const capability = device.capabilities?.find((cap: any) => cap.type === capabilityType)
        if (capability?.state?.value !== undefined) {
            return capability.state.value
        }
        return null
    }

    // Фильтруем устройства с возможностью управления (on_off)
    const controllableDevices = useMemo(() => {
        return devices.filter(device => {
            return device.capabilities?.some((cap: any) => cap.type === "devices.capabilities.on_off")
        })
    }, [devices])

    if (isLoading && subscriptions.length === 0) {
        return (
            <Card className="w-full border-0 shadow-elev-2 bg-gradient-to-br from-card to-surface-3/50">
                <CardContent className="p-8">
                    <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-marine/10 to-brand-700/10 rounded-full flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-marine" />
                        </div>
                        <span className="text-sm font-medium text-content-secondary">Загрузка подписок...</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (subscriptions.length === 0) {
        return (
            <Card className="w-full border-0 shadow-elev-2 bg-gradient-to-br from-card to-surface-3/50">
                <CardHeader className="pb-4 bg-gradient-to-r from-marine/5 to-brand-700/5 rounded-t-lg">
                    <CardTitle className="text-lg font-bold flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-marine to-brand-700 rounded-xl">
                            <Home className="h-5 w-5 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-marine to-brand-700 bg-clip-text text-transparent">
                            Управление умным домом
                        </span>
                    </CardTitle>
                    <CardDescription className="text-content-secondary">
                        Управляйте устройствами в подписанных комнатах
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="flex flex-col items-center justify-center text-center py-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-marine/10 to-brand-700/10 rounded-full flex items-center justify-center mb-4">
                            <Home className="w-10 h-10 text-marine" />
                        </div>
                        <p className="text-sm font-medium text-content-secondary mb-1">Нет подписок на комнаты</p>
                        <p className="text-xs text-content-tertiary">Обратитесь к администратору для подписки на комнату</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-5">
            <Card className="w-full border-0 shadow-elev-3 bg-gradient-to-br from-card to-surface-3/50 overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-marine/5 via-marine/3 to-brand-700/5 rounded-t-lg border-b border-hairline/50">
                    <CardTitle className="text-lg font-bold flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-marine to-brand-700 rounded-xl shadow-elev-2">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-marine to-brand-700 bg-clip-text text-transparent">
                            Управление умным домом
                        </span>
                    </CardTitle>
                    <CardDescription className="text-white/90">
                        Выберите комнату и управляйте устройствами
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                    {/* Выбор комнаты */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Settings2 className="w-4 h-4 text-marine" />
                            Выберите комнату
                        </label>
                        <Select
                            value={selectedRoomId?.toString() || ""}
                            onValueChange={(value) => setSelectedRoomId(value ? parseInt(value) : null)}
                        >
                            <SelectTrigger className="w-full h-11 border-2 border-hairline hover:border-marine/40 transition-colors rounded-xl bg-card shadow-elev-1">
                                <SelectValue placeholder="Выберите комнату" />
                            </SelectTrigger>
                            <SelectContent>
                                {subscriptions.map((sub) => (
                                    <SelectItem key={sub.id} value={sub.meeting_room_id.toString()}>
                                        {sub.meetingRoom?.name || `Комната ID: ${sub.meeting_room_id}`}
                                        {sub.meetingRoom?.office && ` (${sub.meetingRoom.office.name})`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {error && (
                        <div className="bg-gradient-to-r from-danger/10 to-danger/10/50 border-2 border-danger/30 rounded-xl p-4 shadow-elev-1">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-danger/15 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0" />
                                </div>
                                <div className="text-sm font-medium text-danger-600 pt-0.5">{error}</div>
                            </div>
                        </div>
                    )}

                    {selectedRoomId && (
                        <>
                            {isLoading && devices.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-8">
                                    <div className="w-12 h-12 bg-gradient-to-br from-marine/10 to-brand-700/10 rounded-full flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-marine" />
                                    </div>
                                    <span className="text-sm font-medium text-content-secondary">Загрузка устройств...</span>
                                </div>
                            ) : controllableDevices.length === 0 ? (
                                <div className="flex flex-col items-center justify-center text-center py-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-surface-3 to-surface-3 rounded-full flex items-center justify-center mb-3">
                                        <Lightbulb className="w-8 h-8 text-content-tertiary" />
                                    </div>
                                    <p className="text-sm font-medium text-content-secondary mb-1">Нет доступных устройств</p>
                                    <p className="text-xs text-content-tertiary">В этой комнате нет устройств для управления</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-marine" />
                                        Устройства в комнате
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {controllableDevices.map((device) => {
                                            const isOn = getDeviceState(device, "devices.capabilities.on_off")
                                            const isControllingThis = isControlling === device.id

                                            return (
                                                <Card
                                                    key={device.id}
                                                    className={`transition-all duration-300 hover:shadow-elev-2 border-2 ${
                                                        isOn 
                                                            ? 'bg-gradient-to-br from-warning/10/50 to-brand/10/30 border-warning/30/50 shadow-elev-2' 
                                                            : 'bg-gradient-to-br from-card to-surface-3/50 border-hairline hover:border-marine/30'
                                                    }`}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4 flex-1">
                                                                <div className={`p-3 rounded-xl transition-all duration-300 ${
                                                                    isOn 
                                                                        ? 'bg-gradient-to-br from-warning-400 to-brand shadow-elev-2 scale-110' 
                                                                        : 'bg-gradient-to-br from-surface-3 to-surface-3'
                                                                }`}>
                                                                    <Power className={`w-6 h-6 transition-all duration-300 ${
                                                                        isOn ? 'text-white' : 'text-content-tertiary'
                                                                    }`} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-bold text-foreground mb-1">{device.name}</p>
                                                                    <p className="text-xs text-content-tertiary">
                                                                        {device.type?.replace('devices.types.', '') || 'Устройство'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                onClick={() => handleControlDevice(
                                                                    device,
                                                                    "devices.capabilities.on_off",
                                                                    !isOn
                                                                )}
                                                                disabled={isControllingThis || isOn === null}
                                                                className={`h-10 px-4 rounded-xl font-semibold transition-all duration-300 shadow-elev-2 ${
                                                                    isOn
                                                                        ? 'bg-gradient-to-r from-content-quaternary to-surface-3 hover:from-surface-3 hover:to-surface-2 text-white'
                                                                        : 'bg-gradient-to-r from-marine to-brand-700 hover:from-marine-800 hover:to-brand-700 text-white'
                                                                }`}
                                                                size="sm"
                                                            >
                                                                {isControllingThis ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : isOn ? (
                                                                    "Выключить"
                                                                ) : (
                                                                    "Включить"
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

