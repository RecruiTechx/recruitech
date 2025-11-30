"use client"

import { useState } from "react"
import { testSimpleAction } from "@/app/actions/test-simple"
import { checkEnvVars } from "@/app/actions/debug"

export default function DebugPage() {
    const [simpleResult, setSimpleResult] = useState<any>(null)
    const [envResult, setEnvResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const runSimpleTest = async () => {
        try {
            setError(null)
            setSimpleResult("Loading...")
            const res = await testSimpleAction()
            setSimpleResult(res)
        } catch (e: any) {
            console.error(e)
            setError(e.message || "Unknown error")
            setSimpleResult("Failed")
        }
    }

    const runEnvTest = async () => {
        try {
            setError(null)
            setEnvResult("Loading...")
            const res = await checkEnvVars()
            setEnvResult(res)
        } catch (e: any) {
            console.error(e)
            setError(e.message || "Unknown error")
            setEnvResult("Failed")
        }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Debug Server Actions</h1>

            <div className="space-y-6">
                <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <h2 className="font-semibold mb-4">Test Simple Action</h2>
                    <button
                        onClick={runSimpleTest}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Run Simple Test
                    </button>
                    <pre className="mt-4 p-2 bg-gray-100 rounded text-sm overflow-auto">
                        {JSON.stringify(simpleResult, null, 2)}
                    </pre>
                </div>

                <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <h2 className="font-semibold mb-4">Check Env Vars</h2>
                    <button
                        onClick={runEnvTest}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Check Env Vars
                    </button>
                    <pre className="mt-4 p-2 bg-gray-100 rounded text-sm overflow-auto">
                        {JSON.stringify(envResult, null, 2)}
                    </pre>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                        <strong>Error:</strong> {error}
                    </div>
                )}
            </div>
        </div>
    )
}
