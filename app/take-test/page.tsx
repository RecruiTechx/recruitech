"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { SiteHeader } from "@/components/site-header"
import { getUserApplication } from "@/app/actions/application"
import { TestTakingPage } from "@/components/applicant/test-taking-page"

export default function TakeTestPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [application, setApplication] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadApplication = async () => {
            if (!user) {
                router.push("/auth")
                return
            }

            const result = await getUserApplication(user.id)
            if (result.success && result.data) {
                setApplication(result.data)
            } else {
                alert("No application found. Please submit an application first.")
                router.push("/my-application")
            }
            setLoading(false)
        }

        loadApplication()
    }, [user, router])

    if (loading) {
        return (
            <>
                <SiteHeader />
                <main className="mx-auto max-w-7xl px-8 py-12 pt-24">
                    <div className="text-center">
                        <p className="text-gray-600">Loading...</p>
                    </div>
                </main>
            </>
        )
    }

    if (!application) {
        return null
    }

    return (
        <>
            <SiteHeader />
            <main className="mx-auto max-w-7xl px-8 py-12 pt-24">
                <TestTakingPage
                    applicationId={application.id}
                    position={application.position}
                    userId={user!.id}
                />
            </main>
        </>
    )
}
