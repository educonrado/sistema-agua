import { useOnboarding } from '../hooks/useOnboarding'
import { formatCurrency } from '../utils/validation'

export function OnboardingScreen() {
  const {
    loading,
    submitting,
    error,
    formData,
    validationErrors,
    handleFieldChange,
    handleSubmit,
  } = useOnboarding()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Cargando sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <div className="h-14 bg-slate-800 text-white flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button className="w-3 h-3 rounded-full bg-slate-300 opacity-80" aria-label="Volver" />
            <button className="w-3 h-3 rounded-full bg-slate-300 opacity-80" aria-label="Recargar" />
          </div>
          <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-200">💧</div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="text-sm font-medium tracking-wide text-slate-100">
            Sistema Agua - Gestión de Agua Potable
          </div>
        </div>

        <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-sm">+</div>
      </div>

      <div className="max-w-5xl mx-auto bg-slate-50 min-h-[calc(100vh-56px)] p-6 md:p-10">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 lg:p-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Sistema Agua</h1>
            <p className="mt-3 text-xl text-slate-600">Configuración Inicial de la Junta</p>
            <p className="mt-2 text-sm text-slate-500">Complete este formulario para inicializar el sistema</p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="font-semibold text-red-700">Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              {
                key: 'nombreJunta',
                label: 'Nombre Oficial de la Junta',
                type: 'text',
                placeholder: 'Ej: Junta de Agua Potable Santa María',
                helper: '',
                value: formData.nombreJunta,
                error: validationErrors.nombreJunta,
              },
              {
                key: 'costoAguaCruda',
                label: 'Costo del Agua Cruda (por m³)',
                type: 'number',
                placeholder: '0.00',
                helper: 'Costo base de la materia prima',
                value: formData.costoAguaCruda,
                error: validationErrors.costoAguaCruda,
                prefix: '$',
              },
              {
                key: 'limiteConsumoBasico',
                label: 'Límite de Consumo Básico (m³)',
                type: 'number',
                placeholder: '0.000',
                helper: 'Volumen máximo con tarifa base',
                value: formData.limiteConsumoBasico,
                error: validationErrors.limiteConsumoBasico,
              },
              {
                key: 'costoTarifaBase',
                label: 'Costo de la Tarifa Base',
                type: 'number',
                placeholder: '0.00',
                helper: 'Tarifa fija hasta el límite básico',
                value: formData.costoTarifaBase,
                error: validationErrors.costoTarifaBase,
                prefix: '$',
              },
              {
                key: 'costoM3Excedente',
                label: 'Costo del m³ Excedente',
                type: 'number',
                placeholder: '0.00',
                helper: 'Precio por metro cúbico adicional',
                value: formData.costoM3Excedente,
                error: validationErrors.costoM3Excedente,
                prefix: '$',
              },
            ].map((field) => (
              <div key={field.key} className="grid gap-2 md:grid-cols-[1.15fr_1.35fr] md:items-center">
                <label className="text-sm font-semibold text-slate-700 md:pr-4">
                  {field.label} {field.key !== 'adminPassword' && '*'}
                </label>

                <div className="flex flex-col">
                  <div className="relative">
                    {field.prefix && (
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                        {field.prefix}
                      </span>
                    )}

                    <input
                      type={field.type}
                      step={field.type === 'number' && field.key === 'limiteConsumoBasico' ? '0.001' : '0.01'}
                      min="0"
                      value={field.value}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className={`w-full border rounded-md bg-slate-50 px-4 py-3 text-slate-800 transition focus:outline-none focus:ring-2 ${
                        field.prefix ? 'pl-8' : ''
                      } ${
                        field.error
                          ? 'border-red-500 focus:ring-red-200'
                          : 'border-slate-300 focus:border-sky-500 focus:ring-sky-100'
                      }`}
                    />
                  </div>

                  {field.helper && (
                    <span className="mt-1 text-xs text-slate-500">{field.helper}</span>
                  )}

                  {field.error && (
                    <p className="mt-1 text-xs font-medium text-red-600">{field.error}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 mt-6">
              <p className="text-sm font-semibold text-sky-900 mb-2">Ejemplo de Cálculo:</p>
              <p className="text-sm text-sky-800">
                Si un usuario consume 5 m³ siendo el límite básico 3 m³:
              </p>
              <p className="mt-1 text-sm text-sky-800">
                Tarifa = ${formatCurrency(formData.costoTarifaBase)} + (2 × ${formatCurrency(formData.costoM3Excedente)})
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-sky-600 px-4 py-3 text-base font-bold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitting ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>

            <p className="text-center text-xs text-slate-500 mt-4">
              Se creará automáticamente un usuario "Administrador" con credenciales encriptadas
            </p>
          </form>
        </div>

        <div className="mt-8 text-center text-sm text-slate-600">
          Sistema Agua © 2024 - Gestión Comunitaria de Agua Potable
        </div>
      </div>
    </div>
  )
}
