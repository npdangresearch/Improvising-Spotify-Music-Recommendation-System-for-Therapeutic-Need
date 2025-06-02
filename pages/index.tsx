"use client"

import { Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface ApiResponse {
  persona: string
  recommendations: Array<{
    trackName: string
    artistName: string
    energy: number
    acousticness: number
    valence: number
  }>
}

const openSauceStyle = { fontFamily: "OpenSauce, -apple-system, BlinkMacSystemFont, sans-serif" }

// ...existing code...
export default function Component() {
  const [currentScreen, setCurrentScreen] = useState<"home" | "intro" | "persona" | "playlist">("home")
  const [apiData, setApiData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const userName = "UserA" // Replace with dynamic user if available

  const handleMoodCheck = () => {
    setCurrentScreen("intro")
  }

  // Now fetches persona and recommendations
  const handleNext = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("https://improvising-spotify-music-recommendation.onrender.com/")
      if (!response.ok) throw new Error("Failed to fetch recommendations")
      const data = await response.json()
      setApiData(data)
      setCurrentScreen("persona")
    } catch (err) {
      setError("Could not load recommendations. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // handleCreatePlaylist is no longer needed

  const renderHeader = () => (
    <header className="relative z-10 flex items-center justify-between p-6" style={openSauceStyle}>
      {/* ...existing code... */}
    </header>
  )

  const renderHomeScreen = () => (
    <main
      className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6 text-center"
      style={openSauceStyle}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight font-serif">
          Discover your mood with
          <br />
          our Mental Awareness Month
        </h1>
        <p className="text-gray-300 text-lg md:text-xl">Start your Awareness week journey</p>
        <Button
          onClick={handleMoodCheck}
          className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-3 rounded-full text-base"
          style={openSauceStyle}
        >
          Open Mood Check
        </Button>
      </div>
    </main>
  )

  const renderIntroScreen = () => (
    <main
      className="relative z-10 flex flex-col items-start justify-center min-h-[calc(100vh-120px)] px-6"
      style={openSauceStyle}
    >
      <div className="max-w-2xl mx-auto space-y-8 w-full">
        <div className="space-y-4 text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-serif">{`Hi ${userName},`}</h1>
          <p className="text-2xl md:text-3xl text-white font-serif">Are you ready to explore yourself?</p>
        </div>
        <Button
          onClick={handleNext}
          className="bg-green-500 hover:bg-green-600 text-black font-semibold px-12 py-3 rounded-full text-lg"
          style={openSauceStyle}
          disabled={loading}
        >
          {loading ? "Loading..." : "Next"}
        </Button>
        {error && <div className="text-red-400 mt-2">{error}</div>}
      </div>
    </main>
  )

  const renderPersonaScreen = () => (
    <main
      className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6"
      style={openSauceStyle}
    >
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center font-serif">🎭 Your Persona</h1>
          <div className="space-y-6">
            <p className="text-white text-lg whitespace-pre-line">
              {loading
                ? "Loading your musical persona..."
                : error
                ? <span className="text-red-400">{error}</span>
                : apiData?.persona || "No persona data found."}
            </p>
          </div>
        </div>
        <div className="text-center">
          <Button
            onClick={() => setCurrentScreen("playlist")}
            className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-3 rounded-full text-base"
            disabled={!apiData || loading}
            style={openSauceStyle}
          >
            View Playlist
          </Button>
        </div>
      </div>
    </main>
  )

  const renderPlaylistScreen = () => (
    <main
      className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6"
      style={openSauceStyle}
    >
      <div className="max-w-4xl mx-auto space-y-8 w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center">Your personalized playlist</h1>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-white font-semibold text-lg border-b border-gray-600 pb-4">
            <div>Track</div>
            <div>Artist</div>
            <div>Time</div>
          </div>
          <div className="space-y-4">
            {apiData?.recommendations?.length ? (
              apiData.recommendations.map((track, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 text-white text-base">
                  <div>{track.trackName}</div>
                  <div>{track.artistName}</div>
                  <div>
                    {Math.floor(Math.random() * 2) + 1}:
                    {Math.floor(Math.random() * 60)
                      .toString()
                      .padStart(2, "0")}
                  </div>
                </div>
              ))
            ) : (
              Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 text-white text-base">
                  <div>Songs A</div>
                  <div>Artist A</div>
                  <div>1:{10 + index}</div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="text-center pt-8">
          <Button
            className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-3 rounded-full text-base"
            style={openSauceStyle}
          >
            Add to your library
          </Button>
        </div>
      </div>
    </main>
  )

  return (
    <div className="min-h-screen bg-black relative overflow-hidden" style={openSauceStyle}>
      {/* Gradient background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-teal-400/15 rounded-full blur-3xl"></div>
      </div>
      {renderHeader()}
      {currentScreen === "home" && renderHomeScreen()}
      {currentScreen === "intro" && renderIntroScreen()}
      {currentScreen === "persona" && renderPersonaScreen()}
      {currentScreen === "playlist" && renderPlaylistScreen()}
    </div>
  )
}
