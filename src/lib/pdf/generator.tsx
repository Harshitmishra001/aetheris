import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { ResumeContent } from '@/lib/types'

// ============================================================
// ATS-Friendly Resume PDF Template
// Single column, clean typography, no graphics/tables/icons
// ============================================================

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
    color: '#1a1a1a',
  },
  // --- Header ---
  header: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    paddingBottom: 12,
  },
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: '#111111',
    letterSpacing: 0.5,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    fontSize: 9,
    color: '#444444',
  },
  contactItem: {
    marginRight: 12,
  },
  contactSeparator: {
    marginRight: 12,
    color: '#999999',
  },
  // --- Section ---
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#222222',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cccccc',
    paddingBottom: 3,
    marginBottom: 8,
  },
  // --- Summary ---
  summary: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#333333',
  },
  // --- Experience ---
  entryContainer: {
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
  },
  entryDate: {
    fontSize: 9,
    color: '#555555',
  },
  entrySubtitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  entryCompany: {
    fontSize: 10,
    fontFamily: 'Helvetica-Oblique',
    color: '#333333',
  },
  entryLocation: {
    fontSize: 9,
    color: '#555555',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 8,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
    color: '#555555',
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.4,
    color: '#333333',
  },
  // --- Skills ---
  skillCategory: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  skillCategoryLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    color: '#222222',
    minWidth: 100,
  },
  skillItems: {
    flex: 1,
    fontSize: 9.5,
    color: '#333333',
  },
  // --- Projects ---
  projectName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
  },
  projectTech: {
    fontSize: 9,
    color: '#555555',
    marginBottom: 3,
  },
  // --- Certifications ---
  certEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  certName: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
  },
  certIssuer: {
    fontSize: 9,
    color: '#555555',
  },
})

// --- Helper Components ---

function BulletList({ items }: { items: string[] }) {
  return (
    <>
      {items.map((item, index) => (
        <View key={index} style={styles.bulletPoint}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </>
  )
}

function ContactInfo({ content }: { content: ResumeContent }) {
  const items: string[] = []

  if (content.personal.email) items.push(content.personal.email)
  if (content.personal.phone) items.push(content.personal.phone)
  if (content.personal.location) items.push(content.personal.location)
  if (content.personal.linkedin) items.push(content.personal.linkedin)
  if (content.personal.github) items.push(content.personal.github)
  if (content.personal.website) items.push(content.personal.website)

  return (
    <View style={styles.contactRow}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <Text style={styles.contactItem}>{item}</Text>
          {index < items.length - 1 && (
            <Text style={styles.contactSeparator}>|</Text>
          )}
        </React.Fragment>
      ))}
    </View>
  )
}

// --- Main Document Component ---

export function ResumeDocument({ content }: { content: ResumeContent }) {
  return (
    <Document
      title={`${content.personal.name} - Resume`}
      author={content.personal.name}
      subject="Professional Resume"
    >
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{content.personal.name}</Text>
          <ContactInfo content={content} />
        </View>

        {/* Summary */}
        {content.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{content.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {content.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {content.experience.map((exp, index) => (
              <View key={index} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{exp.title}</Text>
                  <Text style={styles.entryDate}>
                    {exp.start_date} — {exp.end_date ?? 'Present'}
                  </Text>
                </View>
                <View style={styles.entrySubtitle}>
                  <Text style={styles.entryCompany}>{exp.company}</Text>
                  {exp.location && (
                    <Text style={styles.entryLocation}>{exp.location}</Text>
                  )}
                </View>
                <BulletList items={exp.bullets} />
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {content.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {content.education.map((edu, index) => (
              <View key={index} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{edu.degree}</Text>
                  <Text style={styles.entryDate}>{edu.graduation_date}</Text>
                </View>
                <View style={styles.entrySubtitle}>
                  <Text style={styles.entryCompany}>{edu.institution}</Text>
                  {edu.location && (
                    <Text style={styles.entryLocation}>{edu.location}</Text>
                  )}
                </View>
                {edu.gpa && (
                  <Text style={styles.bulletText}>GPA: {edu.gpa}</Text>
                )}
                {edu.highlights && edu.highlights.length > 0 && (
                  <BulletList items={edu.highlights} />
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {content.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {content.skills.map((skillGroup, index) => (
              <View key={index} style={styles.skillCategory}>
                <Text style={styles.skillCategoryLabel}>
                  {skillGroup.category}:
                </Text>
                <Text style={styles.skillItems}>
                  {skillGroup.items.join(', ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {content.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {content.projects.map((project, index) => (
              <View key={index} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  {project.url && (
                    <Text style={styles.entryDate}>{project.url}</Text>
                  )}
                </View>
                <Text style={styles.projectTech}>
                  {project.technologies.join(', ')}
                </Text>
                <BulletList items={project.bullets} />
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {content.certifications && content.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {content.certifications.map((cert, index) => (
              <View key={index} style={styles.certEntry}>
                <View>
                  <Text style={styles.certName}>{cert.name}</Text>
                  <Text style={styles.certIssuer}>
                    {cert.issuer} — {cert.date}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}
