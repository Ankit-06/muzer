"use client"
import { signIn, signOut, useSession } from "next-auth/react"
export function Appbar() {
    const userSession = useSession();
    return <div>
        <div className="flex justify-between">
            <div>
                muzi
            </div>
            <div>
                {userSession.data?.user ?
                    <button className="m-2 p-2 bg-blue-400 cursor-pointer" onClick={() => signOut()}>SignOut</button> :
                    <button className="m-2 p-2 bg-blue-400 cursor-pointer" onClick={() => signIn()}>SignIn</button>
                }
            </div>
        </div>
    </div>
}