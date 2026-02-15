"use client";

import { Menu } from "@/components/Menu";
import { Card, Text, Metric, Flex, ProgressBar } from "@tremor/react";

export default function DashboardPage() {
    return (
        <div className="flex min-h-screen bg-slate-950 text-white font-sans">
            <Menu />
            <main className="flex-1 p-8">
                <div className="max-w-5xl mx-auto space-y-8">

                    <header>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-slate-400 mt-2">Hoşgeldin, genel duruma göz at.</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Tremor Card 1 */}
                        <Card className="bg-slate-900 ring-slate-800">
                            <Text className="text-slate-400">Toplam Okunma</Text>
                            <Metric className="text-white">23,456</Metric>
                            <Flex className="mt-4">
                                <Text className="text-slate-500">Hedef: 50k</Text>
                                <Text className="text-white">45%</Text>
                            </Flex>
                            <ProgressBar value={45} color="blue" className="mt-2" />
                        </Card>

                        {/* Tremor Card 2 */}
                        <Card className="bg-slate-900 ring-slate-800">
                            <Text className="text-slate-400">Aktif Yazarlar</Text>
                            <Metric className="text-white">12</Metric>
                            <div className="h-10 mt-4 bg-slate-800 rounded flex items-center px-2 text-xs text-slate-500">
                                Admin, Editor, Writer...
                            </div>
                        </Card>

                        {/* Tremor Card 3 */}
                        <Card className="bg-slate-900 ring-slate-800">
                            <Text className="text-slate-400">Ortalama Süre</Text>
                            <Metric className="text-white">4m 12s</Metric>
                            <div className="h-10 mt-4 bg-slate-800 rounded flex items-center px-2 text-xs text-slate-500">
                                Geçen haftaya göre +12%
                            </div>
                        </Card>
                    </div>

                    <Card className="bg-slate-900 ring-slate-800 min-h-[300px] flex items-center justify-center border-dashed border-2 border-slate-700">
                        <Text className="text-slate-500 text-lg">Grafik alanı (Tremor/Recharts)</Text>
                    </Card>

                </div>
            </main>
        </div>
    );
}
