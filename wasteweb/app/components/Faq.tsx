'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'

const faqs = [
  {
    q: 'What is WasteFlow?',
    a: 'WasteFlow is a smart skip management and construction waste logistics platform built for UK construction sites. It connects site managers, drivers, and fleet operators into one real-time system — making skip dispatch, tracking, and reporting effortless.',
  },
  {
    q: 'How does real-time skip tracking work?',
    a: 'Every skip in your fleet is tracked via live GPS. Site managers can see exactly where each skip is, when it was collected, and when the next delivery is due — all from a single dashboard.',
  },
  {
    q: 'Can I manage multiple construction sites at once?',
    a: 'Yes. WasteFlow is built for multi-site operations. You can manage skip allocations, approvals, and driver assignments across all your active sites from one centralised view.',
  },
  {
    q: 'How do I add my skip fleet to WasteFlow?',
    a: 'Fleet owners can register on the platform, submit vehicle and skip details, and get onboarded with our management tools. We handle verification, GPS setup, and driver assignment so you can get moving quickly.',
  },
  {
    q: 'Is WasteFlow available across the whole UK?',
    a: 'WasteFlow is designed to support construction sites nationwide across England, Scotland, Wales, and Northern Ireland. Coverage depends on your registered fleet locations — the platform works wherever your skips go.',
  },
  {
    q: 'How does WasteFlow help reduce costs?',
    a: 'By optimising dispatch routes, reducing idle time, and eliminating manual coordination, WasteFlow cuts fuel costs, unnecessary hires, and admin overhead — saving money on every job.',
  },
  {
    q: 'Is my data secure on WasteFlow?',
    a: 'Absolutely. WasteFlow is built with enterprise-grade security, UK GDPR compliance, and encrypted data storage. Your fleet data, site records, and driver information are fully protected.',
  },
]

function FAQItem({
  item,
  index,
  inView,
}: {
  item: (typeof faqs)[0]
  index: number
  inView: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.1 + index * 0.08,
      }}
      style={{
        borderRadius: '1rem',
        overflow: 'hidden',
        border: `1px solid ${open ? 'rgba(184,213,46,0.25)' : 'rgba(255,255,255,0.07)'}`,
        background: open ? 'rgba(184,213,46,0.06)' : 'rgba(255,255,255,0.02)',
        transition: 'background 0.3s, border-color 0.3s',
        fontFamily: "'Quicksand', sans-serif",
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1.25rem 1.5rem',
          textAlign: 'left',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: "'Quicksand', sans-serif",
        }}
      >
        <span style={{
          color: open ? '#fff' : 'rgba(255,255,255,0.85)',
          fontWeight: 700,
          fontSize: '0.95rem',
          lineHeight: 1.4,
          transition: 'color 0.2s',
          fontFamily: "'Quicksand', sans-serif",
        }}>
          {item.q}
        </span>

        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            flexShrink: 0,
            width: '1.75rem', height: '1.75rem',
            borderRadius: '50%',
            border: `1px solid ${open ? 'rgba(184,213,46,0.4)' : 'rgba(255,255,255,0.15)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: open ? '#B8D52E' : 'rgba(255,255,255,0.4)',
            transition: 'border-color 0.2s, color 0.2s',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{ padding: '0 1.5rem 1.25rem' }}>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1rem' }} />
              <p style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: '0.875rem',
                lineHeight: 1.75,
                margin: 0,
                fontFamily: "'Quicksand', sans-serif",
              }}>
                {item.a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQ() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="faq"
      ref={ref}
      style={{
        position: 'relative',
        padding: '6rem 0',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #001a13 0%, #002b1f 50%, #001510 100%)',
        fontFamily: "'Quicksand', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Dot grid texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Decorative glows */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(184,213,46,0.10) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '350px', height: '250px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,80,55,0.35) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }} />
      </div>

      <div style={{
        position: 'relative', zIndex: 10,
        maxWidth: '768px', margin: '0 auto',
        padding: '0 1.25rem',
      }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}
        >
          {/* Pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em',
              padding: '0.35rem 0.85rem', borderRadius: '9999px',
              border: '1px solid rgba(184,213,46,0.3)',
              background: 'rgba(184,213,46,0.07)', color: '#B8D52E',
            }}>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 5, height: 5, borderRadius: '50%', background: '#B8D52E', display: 'inline-block' }}
              />
              More Information
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2.4rem)',
              fontWeight: 700, color: '#fff',
              margin: '0 0 0.75rem 0', letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            Questions?{' '}
            <span style={{ color: '#B8D52E' }}>We&apos;ve got answers.</span>
          </motion.h2>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.18 }}
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 'clamp(0.8rem, 1.6vw, 0.9rem)',
              maxWidth: '460px', margin: '0 auto',
              lineHeight: 1.7, fontWeight: 500,
            }}
          >
            Everything you need to know about WasteFlow before you get started.
          </motion.p>
        </motion.div>

        {/* FAQ list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map((item, i) => (
            <FAQItem key={item.q} item={item} index={i} inView={inView} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.65 }}
          style={{ textAlign: 'center', marginTop: '3rem' }}
        >
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem', margin: 0 }}>
            Still have questions?{' '}
            <a
              href="mailto:hello@wasteflow.co.uk"
              style={{
                color: '#B8D52E', fontWeight: 600,
                textDecoration: 'none', transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
     info@wasteflow.org
            </a>
          </p>
        </motion.div>

      </div>
    </section>
  )
}