"use server"

export async function testSimpleAction() {
    console.log('Test simple action called')
    return { success: true, message: 'Hello from server' }
}
