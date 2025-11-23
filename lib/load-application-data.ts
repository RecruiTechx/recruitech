import { getUserApplication } from "@/app/actions/application"

export async function loadExistingApplicationData(userId: string) {
    const result = await getUserApplication(userId)

    if (!result.success || !result.data) {
        return null
    }

    const application = result.data

    // Extract personal information
    const personalInfo = application.personal_information
    const documents = application.documents

    return {
        applicationId: application.id,
        formData: personalInfo ? {
            fullName: personalInfo.full_name || "",
            npm: personalInfo.npm || "",
            department: personalInfo.department || "DTE",
            major: personalInfo.major || "Teknik Elektro",
            force: personalInfo.force || "2024",
            email: personalInfo.email || "",
            phoneNumber: personalInfo.phone_number || "",
            idLine: personalInfo.id_line || "",
            otherContacts: personalInfo.other_contacts || "",
        } : null,
        existingDocuments: documents ? {
            cvUrl: documents.cv_url,
            motivationLetterUrl: documents.motivation_letter_url,
            followProofUrl: documents.follow_proof_url,
            twibbonUrl: documents.twibbon_url,
        } : {}
    }
}
