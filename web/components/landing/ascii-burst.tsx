"use client"

import { useEffect, useRef } from "react"

const GLYPHS = ".:-=+*#%/"

type Ray = { angle: number; length: number; seed: number }
type Pulse = { x: number; y: number; born: number }

/**
 * Decorative ASCII starburst behind the hero headline. Click or tap sends a
 * "message" pulse through the rays. Static under reduced motion and paused
 * while offscreen.
 */
export function AsciiBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    const ctx = canvas?.getContext("2d")
    if (!canvas || !parent || !ctx) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const style = getComputedStyle(canvas)
    const color = style.color
    // Canvas fonts can't read CSS variables; use the resolved family.
    const family = style.fontFamily || "monospace"
    const rays: Ray[] = Array.from({ length: 64 }, (_, i) => ({
      angle: (i / 64) * Math.PI * 2 + Math.sin(i * 12.9898) * 0.05,
      length: 0.45 + ((Math.sin(i * 78.233) + 1) / 2) * 0.55,
      seed: i * 3.7,
    }))
    const pulses: Pulse[] = []
    let width = 0
    let height = 0
    let frame = 0
    let visible = true

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = parent!.clientWidth
      height = parent!.clientHeight
      canvas!.width = width * dpr
      canvas!.height = height * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw(performance.now())
    }

    function draw(now: number) {
      const t = reduce ? 0 : now / 1000
      ctx!.clearRect(0, 0, width, height)
      const cx = width / 2
      const cy = height * 0.48
      const reach = Math.max(width, height) * 0.62
      const inner = Math.min(width, height) * 0.1
      const step = width < 640 ? 11 : 14
      ctx!.font = `${width < 640 ? 10 : 12}px ${family}`
      ctx!.textAlign = "center"
      ctx!.textBaseline = "middle"
      ctx!.fillStyle = color

      for (const ray of rays) {
        const max =
          inner +
          reach * ray.length * (0.92 + 0.08 * Math.sin(t * 0.6 + ray.seed))
        const angle = ray.angle + Math.sin(t * 0.15) * 0.04
        for (let r = inner; r < max; r += step) {
          const x = cx + Math.cos(angle) * r
          const y = cy + Math.sin(angle) * r * 0.78
          let alpha =
            0.22 * Math.min(1, (r - inner) / 80) * (1 - r / (max + 40))
          for (const pulse of pulses) {
            const age = (now - pulse.born) / 1000
            const front = age * 900
            const d = Math.hypot(x - pulse.x, y - pulse.y)
            if (Math.abs(d - front) < 40) alpha += 0.5 * (1 - age / 1.6)
          }
          if (alpha <= 0.01) continue
          const g = Math.floor(
            Math.abs(Math.sin(ray.seed + r * 0.07 + Math.floor(t * 3) * 0.9)) *
              GLYPHS.length
          )
          ctx!.globalAlpha = Math.min(alpha, 0.9)
          ctx!.fillText(GLYPHS[g] ?? ".", x, y)
        }
      }
      ctx!.globalAlpha = 1
      for (let i = pulses.length - 1; i >= 0; i--)
        if (now - pulses[i].born > 1600) pulses.splice(i, 1)
    }

    function loop(now: number) {
      if (visible) draw(now)
      frame = requestAnimationFrame(loop)
    }

    function onPointer(event: PointerEvent) {
      if (reduce) return
      const target = event.target as HTMLElement
      if (target.closest("a, button, input, [role='button']")) return
      const rect = canvas!.getBoundingClientRect()
      pulses.push({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        born: performance.now(),
      })
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    observer.observe(canvas)
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(parent)
    resize()
    if (!reduce) frame = requestAnimationFrame(loop)
    parent.addEventListener("pointerdown", onPointer)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      resizeObserver.disconnect()
      parent.removeEventListener("pointerdown", onPointer)
    }
  }, [])

  return <canvas ref={canvasRef} className="ascii-burst" aria-hidden="true" />
}
