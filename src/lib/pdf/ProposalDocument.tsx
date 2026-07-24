import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Lead } from "@/types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#7c3aed",
    paddingBottom: 16,
    marginBottom: 24,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7c3aed",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#7c3aed",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 4,
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  fieldLabel: {
    width: 120,
    fontSize: 10,
    color: "#6b7280",
  },
  fieldValue: {
    flex: 1,
    fontSize: 10,
    color: "#1a1a1a",
  },
  scoreBox: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#7c3aed",
  },
  scoreLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 4,
  },
  proposalContent: {
    fontSize: 10,
    lineHeight: 1.6,
    color: "#1a1a1a",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    fontSize: 8,
    color: "#9ca3af",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

interface ProposalDocumentProps {
  lead: Lead;
  proposal: string;
}

export function ProposalDocument({ lead, proposal }: ProposalDocumentProps) {
  const now = new Date().toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>Valencia Studio</Text>
        </View>

        <Text style={styles.title}>Propuesta Comercial</Text>
        <Text style={{ fontSize: 10, color: "#6b7280", marginBottom: 24 }}>
          {now}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Lead</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Nombre:</Text>
            <Text style={styles.fieldValue}>{lead.name}</Text>
          </View>
          {lead.email && (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Email:</Text>
              <Text style={styles.fieldValue}>{lead.email}</Text>
            </View>
          )}
          {lead.phone && (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Teléfono:</Text>
              <Text style={styles.fieldValue}>{lead.phone}</Text>
            </View>
          )}
          {lead.address && (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Dirección:</Text>
              <Text style={styles.fieldValue}>{lead.address}</Text>
            </View>
          )}
          {lead.website_url && (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Sitio web:</Text>
              <Text style={styles.fieldValue}>{lead.website_url}</Text>
            </View>
          )}
        </View>

        {lead.opportunity_score !== null && lead.opportunity_score !== undefined && (
          <View style={styles.scoreBox}>
            <Text style={styles.scoreValue}>{lead.opportunity_score}</Text>
            <Text style={styles.scoreLabel}>Score AI (0-100)</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Propuesta</Text>
          <Text style={styles.proposalContent}>{proposal}</Text>
        </View>

        <View style={styles.footer}>
          <Text>Valencia Studio - Soluciones digitales</Text>
          <Text>Página 1</Text>
        </View>
      </Page>
    </Document>
  );
}
