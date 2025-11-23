"use client"

import Link from "next/link"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { 
  createApplication, 
  savePersonalInformation,
  saveDocuments,
  submitApplication,
  type PersonalInfoFormData 
} from "@/app/actions/application"

export default function DocumentScreeningPage() {
  const [activeTab, setActiveTab] = useState<"personal" | "document">("personal")
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [position, setPosition] = useState<string>("ui-ux")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTestWarning, setShowTestWarning] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  // Form data
  const [formData, setFormData] = useState<PersonalInfoFormData>({
    fullName: "",
    npm: "",
    department: "DTE",
    major: "Teknik Elektro",
    force: "2024",
    email: "",
    phoneNumber: "",
    idLine: "",
    otherContacts: "",
  })

  // File uploads
  const [files, setFiles] = useState<{
    cv: File | null
    motivationLetter: File | null
    followProof: File | null
    twibbon: File | null
  }>({
    cv: null,
    motivationLetter: null,
    followProof: null,
    twibbon: null,
  })

  // Initialize application
  useEffect(() => {
    const initApplication = async () => {
      if (!user) {
        router.push("/auth")
        return
      }

      // Get position from URL or localStorage
      const positionParam = new URLSearchParams(window.location.search).get("position") || "ui-ux"
      setPosition(positionParam)
      
      // Check for existing application first
      const { getUserApplication } = await import("@/app/actions/application")
      const existingApp = await getUserApplication(user.id)
      
      if (existingApp.success && existingApp.data) {
        // User already has an application - redirect to My Application page
        router.push("/my-application")
        return
      } else {
        // Create new application
        const result = await createApplication(user.id, positionParam)
        if (result.success && 'data' in result && result.data) {
          setApplicationId(result.data.id)
        } else {
          setError('error' in result ? (result.error || "Failed to create application") : "Failed to create application")
        }
      }
    }

    initApplication()
  }, [user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleFileChange = (type: keyof typeof files, file: File | null) => {
    setFiles(prev => ({
      ...prev,
      [type]: file
    }))
  }

  const handleSavePersonalInfo = async () => {
    if (!applicationId) {
      setError("Application not initialized")
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await savePersonalInformation(applicationId, formData)
      
      if (result.success) {
        setActiveTab("document")
        return true
      } else {
        setError(result.error || "Failed to save personal information")
        return false
      }
    } catch (err) {
      setError("An unexpected error occurred")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const uploadFileToAPI = async (file: File, fileType: string): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', user!.id)
    formData.append('fileType', fileType)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()
    
    if (result.success && result.url) {
      return result.url
    } else {
      console.error('Upload error:', result.error)
      return null
    }
  }

  const handleSubmit = async () => {
    if (!applicationId || !user) {
      setError("Application not initialized")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Upload files using API route
      const documentUrls: {
        cvUrl?: string
        motivationLetterUrl?: string
        followProofUrl?: string
        twibbonUrl?: string
      } = {}

      if (files.cv) {
        const url = await uploadFileToAPI(files.cv, 'cv')
        if (url) documentUrls.cvUrl = url
      }

      if (files.motivationLetter) {
        const url = await uploadFileToAPI(files.motivationLetter, 'motivationLetter')
        if (url) documentUrls.motivationLetterUrl = url
      }

      if (files.followProof) {
        const url = await uploadFileToAPI(files.followProof, 'followProof')
        if (url) documentUrls.followProofUrl = url
      }

      if (files.twibbon) {
        const url = await uploadFileToAPI(files.twibbon, 'twibbon')
        if (url) documentUrls.twibbonUrl = url
      }

      // Save document URLs
      const docResult = await saveDocuments(applicationId, documentUrls)
      if (!docResult.success) {
        setError(docResult.error || "Failed to save documents")
        return
      }

      // Submit application
      const submitResult = await submitApplication(applicationId)
      if (submitResult.success) {
        // Show warning before redirecting to test
        setShowTestWarning(true)
      } else {
        setError('error' in submitResult ? (submitResult.error || "Failed to submit application") : "Failed to submit application")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartTest = () => {
    const testRoutes: Record<string, string> = {
      'ui-ux': '/test/ui-ux',
      'software-engineer': '/test/software-engineer',
      'project-manager': '/test/project-manager'
    }
    
    const testRoute = testRoutes[position] || '/test/ui-ux'
    router.push(testRoute)
  }

  return (
    <>
      <SiteHeader />

      {/* Test Warning Modal */}
      {showTestWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Technical Test</h2>
              <p className="text-gray-600 mb-4">
                Your application has been submitted successfully!
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-pink-800 mb-2">⚠️ Important Instructions:</h3>
              <ul className="text-sm text-pink-700 space-y-2 list-disc list-inside">
                <li>The test will start immediately when you proceed</li>
                <li>You will have limited time to complete the test</li>
                <li>Make sure you have a stable internet connection</li>
                <li>Find a quiet place to focus</li>
                <li>You cannot pause once the test begins</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowTestWarning(false)
                  router.push('/dashboard')
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
              >
                Take Later
              </button>
              <button
                onClick={handleStartTest}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                Start Test Now
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Progress Navbar */}
      <div className="fixed top-16 left-0 right-0 z-40 w-full border-b border-transparent bg-transparent shadow-sm">
        <div className="relative w-full">
          {/* Background gradient */}
          <div className="absolute inset-0 w-full">
            <Image
              src="/navbar-progress/navbar-progress-block-background.png"
              alt=""
              width={1440}
              height={120}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          
          {/* Progress blocks on top */}
          <div className="relative z-10 mx-auto max-w-7xl px-8 py-6">
            <Image
              src="/navbar-progress/navbar-phase-2.png"
              alt="Progress: Document Screening - On Progress"
              width={1200}
              height={70}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-8 py-12 pt-48">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-pink-600 mb-4">Document Screening</h1>
          <p className="text-gray-600">Please fill in your personal information and upload required documents</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab("personal")}
            className={`px-8 py-3 font-semibold rounded-lg transition-colors ${
              activeTab === "personal" 
                ? "bg-pink-600 text-white" 
                : "bg-pink-100 text-pink-600 hover:bg-pink-200"
            }`}
          >
            Personal Information
          </button>
          <button 
            onClick={() => setActiveTab("document")}
            className={`px-8 py-3 font-semibold rounded-lg transition-colors ${
              activeTab === "document" 
                ? "bg-pink-600 text-white" 
                : "bg-pink-100 text-pink-600 hover:bg-pink-200"
            }`}
          >
            Document
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          {activeTab === "personal" ? (
          <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Lorem Ipsum"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* NPM */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                NPM
              </label>
              <input
                type="text"
                name="npm"
                value={formData.npm}
                onChange={handleInputChange}
                placeholder="2306***"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department
              </label>
              <select 
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
              >
                <option value="DTE">DTE</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Computer Engineering">Computer Engineering</option>
              </select>
            </div>

            {/* Major */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Major
              </label>
              <select 
                name="major"
                value={formData.major}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
              >
                <option value="Teknik Elektro">Teknik Elektro</option>
                <option value="Other Major">Other Major</option>
              </select>
            </div>

            {/* Force */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Force
              </label>
              <select 
                name="force"
                value={formData.force}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Lorem Ipsum"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="08***"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* ID Line */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ID Line
              </label>
              <input
                type="text"
                name="idLine"
                value={formData.idLine}
                onChange={handleInputChange}
                placeholder="Lorem Ipsum"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Other Contacts */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Other Contacts We Can Contact
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Format: [ID Line/Whatsapp - Name - Relationship (Example: Friend/Sister/Mother)]
            </p>
            <input
              type="text"
              name="otherContacts"
              value={formData.otherContacts}
              onChange={handleInputChange}
              placeholder="08*** - Name - Relationship"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Next Button */}
          <div className="flex justify-end mt-8">
            <button 
              onClick={handleSavePersonalInfo}
              disabled={isLoading}
              className="px-12 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Next"}
            </button>
          </div>
          </div>
          ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Curriculum Vitae (CV) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Curriculum Vitae (CV)
                </label>
                <p className="text-xs text-gray-500 mb-3">NOTE: Must use ATS CV!</p>
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 transition-colors cursor-pointer block">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange('cv', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {files.cv ? (
                      <p className="text-sm text-green-600 font-semibold mb-1">{files.cv.name}</p>
                    ) : (
                      <p className="text-sm text-gray-600 mb-1">
                        Drag and drop file or <span className="text-pink-600 font-semibold">Choose File</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">Supported formats: PDF</p>
                    <p className="text-xs text-gray-400">Maximum Size: 10 MB</p>
                  </div>
                </label>
              </div>

              {/* Motivation Letter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Motivation Letter
                </label>
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 transition-colors cursor-pointer block mt-8">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange('motivationLetter', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {files.motivationLetter ? (
                      <p className="text-sm text-green-600 font-semibold mb-1">{files.motivationLetter.name}</p>
                    ) : (
                      <p className="text-sm text-gray-600 mb-1">
                        Drag and drop file or <span className="text-pink-600 font-semibold">Choose File</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">Supported formats: PDF</p>
                    <p className="text-xs text-gray-400">Maximum Size: 10 MB</p>
                  </div>
                </label>
              </div>

              {/* @exercise.ftui Follow Proof */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  @exercise.ftui Follow Proof
                </label>
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 transition-colors cursor-pointer block">
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={(e) => handleFileChange('followProof', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {files.followProof ? (
                      <p className="text-sm text-green-600 font-semibold mb-1">{files.followProof.name}</p>
                    ) : (
                      <p className="text-sm text-gray-600 mb-1">
                        Drag and drop file or <span className="text-pink-600 font-semibold">Choose File</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">Supported formats: PNG, JPG</p>
                    <p className="text-xs text-gray-400">Maximum Size: 10 MB</p>
                  </div>
                </label>
              </div>

              {/* Twibbon InstaStory Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Twibbon InstaStory Upload
                </label>
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 transition-colors cursor-pointer block">
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={(e) => handleFileChange('twibbon', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {files.twibbon ? (
                      <p className="text-sm text-green-600 font-semibold mb-1">{files.twibbon.name}</p>
                    ) : (
                      <p className="text-sm text-gray-600 mb-1">
                        Drag and drop file or <span className="text-pink-600 font-semibold">Choose File</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">Supported formats: PNG, JPG</p>
                    <p className="text-xs text-gray-400">Maximum Size: 10 MB</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8">
              <button 
                onClick={() => setActiveTab("personal")}
                disabled={isLoading}
                className="px-12 py-3 border-2 border-pink-500 text-pink-500 font-semibold rounded-full hover:bg-pink-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-12 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
          )}
        </div>
      </main>
    </>
  )
}
