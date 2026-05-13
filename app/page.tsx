import KeyInput from '@/components/KeyInput'
import ThemeToggle from '@/components/ThemeToggle'
import GlitchBackground from '@/components/GlitchBackground'

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center">
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        <GlitchBackground />
        <div className="block dark:hidden" style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(242,241,238,0.8)',
          pointerEvents: 'none',
        }} />
        <div className="hidden dark:block" style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.9)',
          pointerEvents: 'none',
        }} />
      </div>

      <div style={{ position: 'fixed', top: '20px', right: '24px', zIndex: 20 }}>
        <ThemeToggle />
      </div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}>
        <KeyInput />
      </div>
    </main>
  )
}
