import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useState, useEffect } from 'react'
import './Stack.css'

function CardRotate({ children, onSendToBack, sensitivity }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [30, -30])
  const rotateY = useTransform(x, [-100, 100], [-30, 30])

  function handleDragEnd(_, info) {
    if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
      onSendToBack()
    } else {
      x.set(0)
      y.set(0)
    }
  }

  return (
    <motion.div
      className="stack-card-rotate"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.5}
      whileTap={{ cursor: 'grabbing' }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  )
}

export default function Stack({
  cards = [],
  sensitivity = 140,
  animationConfig = { stiffness: 240, damping: 22 },
  sendToBackOnClick = true,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
}) {
  const [stack, setStack] = useState(() =>
    cards.map((content, i) => ({ id: i, content }))
  )
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    setStack(cards.map((content, i) => ({ id: i, content })))
  }, [cards])

  const sendToBack = id => {
    setStack(prev => {
      const next = [...prev]
      const idx = next.findIndex(c => c.id === id)
      const [card] = next.splice(idx, 1)
      next.unshift(card)
      return next
    })
  }

  useEffect(() => {
    if (!autoplay || stack.length < 2 || isPaused) return
    const iv = setInterval(() => sendToBack(stack[stack.length - 1].id), autoplayDelay)
    return () => clearInterval(iv)
  }, [autoplay, autoplayDelay, stack, isPaused])

  return (
    <div
      className="stack-container"
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {stack.map((card, index) => (
        <CardRotate
          key={card.id}
          onSendToBack={() => sendToBack(card.id)}
          sensitivity={sensitivity}
        >
          <motion.div
            className="stack-card"
            onClick={() => sendToBackOnClick && sendToBack(card.id)}
            animate={{
              rotateZ: (stack.length - index - 1) * 3.5,
              scale: 1 + index * 0.055 - stack.length * 0.055,
              transformOrigin: '88% 92%',
            }}
            initial={false}
            transition={{
              type: 'spring',
              stiffness: animationConfig.stiffness,
              damping: animationConfig.damping,
            }}
          >
            {card.content}
          </motion.div>
        </CardRotate>
      ))}
    </div>
  )
}
