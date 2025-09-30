"use client"
import { RealtimeChat } from '@/components/realtime-chat'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export default function ChatPage() {
    const [username, setUsername] = useState('')
    return (
        <>
            <Input placeholder="Type your username..." value={username} onChange={(e) => setUsername(e.target.value)} />
            <RealtimeChat roomName="my-chat-room" username={username} />
        </>
    )
}
