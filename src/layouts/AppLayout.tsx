import { Outlet } from "react-router"

import { FarmCycleProvider, useFarmCycle } from "@/context/FarmCycleContext"
import FarmSidebar, { FarmMobileNav } from "@/components/layout/FarmSidebar"
import FarmTopbar from "@/components/layout/FarmTopbar"

function AppLayoutContent() {
  const {
    cycles,
    selectedCycleId,
    setSelectedCycleId,
    isLoadingCycles,
    refreshAll,
  } = useFarmCycle()

  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_10%_0%,rgba(201,226,189,0.26),transparent_28%),linear-gradient(180deg,#fbfbf8_0%,#f7f8f2_60%,#f3f4ee_100%)] text-slate-900">
      <div className="mx-auto flex min-h-svh max-w-[1520px] gap-5 px-3 py-3 sm:px-4 lg:px-5">
        <FarmSidebar />

        <main className="flex min-w-0 flex-1 flex-col gap-5">
          <FarmTopbar
            cycles={cycles}
            selectedCycleId={selectedCycleId}
            isLoading={isLoadingCycles}
            onCycleChange={setSelectedCycleId}
            onRefresh={() => {
              void refreshAll()
            }}
          />
          <FarmMobileNav />
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function AppLayout() {
  return (
    <FarmCycleProvider>
      <AppLayoutContent />
    </FarmCycleProvider>
  )
}

export default AppLayout
