import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const electronAPI = typeof window !== 'undefined' ? window.electronAPI : null

  useEffect(() => {
    const loadConfiguration = async () => {
      if (!electronAPI) {
        setError('La configuración solo está disponible dentro de la app de Electron.')
        setLoading(false)
        return
      }

      try {
        const configuration = await electronAPI.configGet()
        setConfig(configuration)
      } catch (err) {
        console.error('Error loading configuration:', err)
        setError('Error al cargar la configuración')
      } finally {
        setLoading(false)
      }
    }

    loadConfiguration()
  }, [electronAPI])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-200 p-8">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-semibold">Error</p>
          <p className="text-red-600 text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <div className="h-14 bg-slate-800 text-white flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-200">💧</div>
          <div className="text-sm font-medium tracking-wide">Sistema Agua</div>
        </div>
        <div className="text-sm text-slate-300">Panel de control</div>
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-sky-700">Junta de agua</p>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-1">
              {config?.nombreJunta || 'Sistema Agua'}
            </h1>
          </div>
          <div className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-sm font-medium text-emerald-700">
            Sistema activo
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500 mb-2">Nombre de la Junta</p>
            <p className="text-xl font-bold text-slate-900">{config?.nombreJunta}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500 mb-2">Costo Agua Cruda</p>
            <p className="text-xl font-bold text-sky-700">${config?.costoAguaCruda?.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500 mb-2">Límite Consumo Básico</p>
            <p className="text-xl font-bold text-sky-700">{config?.limiteConsumoBasico?.toFixed(3)} m³</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500 mb-2">Tarifa Base</p>
            <p className="text-xl font-bold text-emerald-700">${config?.costoTarifaBase?.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500 mb-2">m³ Excedente</p>
            <p className="text-xl font-bold text-emerald-700">${config?.costoM3Excedente?.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500 mb-2">Configurado el</p>
            <p className="text-xl font-bold text-slate-900">
              {config?.createdAt ? new Date(config.createdAt).toLocaleDateString('es-ES') : '-'}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white hover:shadow-md rounded-xl p-6 text-left border border-slate-200 transition">
            <div className="text-4xl mb-3">📖</div>
            <h3 className="font-bold text-slate-800 mb-1">Lecturas</h3>
            <p className="text-sm text-slate-600">Registrar nueva lectura</p>
          </button>

          <button className="bg-white hover:shadow-md rounded-xl p-6 text-left border border-slate-200 transition">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="font-bold text-slate-800 mb-1">Usuarios</h3>
            <p className="text-sm text-slate-600">Gestionar operadores</p>
          </button>

          <button className="bg-white hover:shadow-md rounded-xl p-6 text-left border border-slate-200 transition">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-bold text-slate-800 mb-1">Reportes</h3>
            <p className="text-sm text-slate-600">Ver indicadores</p>
          </button>
        </div>
      </div>
    </div>
  )
}
