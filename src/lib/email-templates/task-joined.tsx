import React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  title?: string
  org?: string
  city?: string
  when?: string
  duration?: string
  points?: number
  googleUrl?: string
  outlookUrl?: string
}

const TaskJoined = ({ name, title = 'your task', org, city, when, duration, points, googleUrl, outlookUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`You're in: ${title}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>GiveBack</Text>
        <Heading style={h1}>You're in! 🎉</Heading>
        <Text style={text}>{name ? `Thanks ${name},` : 'Thank you,'} you've signed up to lend a hand.</Text>
        <Section style={card}>
          <Text style={cardTitle}>{title}</Text>
          {org && <Text style={row}>🤝 {org}</Text>}
          {city && <Text style={row}>📍 {city}</Text>}
          {when && <Text style={row}>🗓 {when}</Text>}
          {duration && <Text style={row}>⏱ {duration}</Text>}
          {points != null && <Text style={pts}>+{points} points</Text>}
        </Section>
        {googleUrl && <Button style={btn} href={googleUrl}>Add to Google Calendar</Button>}
        {outlookUrl && <Button style={btnAlt} href={outlookUrl}>Add to Outlook</Button>}
        <Text style={foot}>Small acts, big change. See you there!</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: TaskJoined,
  subject: (d: Record<string, any>) => `You're in: ${d['title'] ?? 'your GiveBack task'}`,
  displayName: 'Task joined',
  previewData: { name: 'Wiam', title: 'Sort donations at the food bank', org: 'Hackney Food Bank', city: 'London', when: 'Sat 10am', duration: '1h', points: 60, googleUrl: 'https://calendar.google.com', outlookUrl: 'https://outlook.live.com' },
} satisfies TemplateEntry

const font = 'Poppins, Helvetica, Arial, sans-serif'
const main = { backgroundColor: '#ffffff', fontFamily: font }
const container = { padding: '32px 24px', maxWidth: '520px' }
const brand = { color: '#C8553D', fontWeight: 700, fontSize: '20px', margin: '0 0 16px' }
const h1 = { color: '#2B2118', fontSize: '26px', margin: '0 0 8px' }
const text = { color: '#5A4A3F', fontSize: '15px', lineHeight: '24px' }
const card = { backgroundColor: '#FBF4EA', borderRadius: '16px', padding: '16px 20px', margin: '16px 0 24px', borderTop: '6px solid #C8553D' }
const cardTitle = { color: '#2B2118', fontSize: '17px', fontWeight: 600, margin: '0 0 8px' }
const row = { color: '#5A4A3F', fontSize: '14px', margin: '2px 0' }
const pts = { color: '#C8553D', fontSize: '15px', fontWeight: 700, margin: '10px 0 0' }
const btn = { backgroundColor: '#C8553D', color: '#ffffff', borderRadius: '999px', padding: '12px 20px', fontSize: '14px', fontWeight: 600, marginRight: '8px', marginBottom: '8px' }
const btnAlt = { ...btn, backgroundColor: '#E8B04B', color: '#2B2118' }
const foot = { color: '#8A7A6E', fontSize: '13px', marginTop: '24px' }
