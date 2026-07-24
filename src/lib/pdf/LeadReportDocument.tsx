import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Lead, ContactAttempt } from "@/types";

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
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  scoreItem: {
    alignItems: "center",
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7c3aed",
  },
  scoreLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  contactItem: {
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 4,
    marginBottom: 8,
  },
  contactHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  contactType: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  contactDate: {
    fontSize: 8,
    color: "#6b7280",
  },
  contactNotes: {
    fontSize: 9,
    color: "#4b5563",
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

interface LeadReportDocumentProps {
  lead: Lead;
  proposal?: string | null;
  contacts: ContactAttempt[];
}

export function LeadReportDocument({ lead, proposal, contacts }: LeadReportDocumentProps) {
  const now = new Date().toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>Valencia Studio</Text>
        </View>

        <Text style={styles.title}>Reporte del Lead</Text>
        <Text style={{ fontSize: 10, color: "#6b7280", marginBottom: 24 }}>
          Generado el {now}
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
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Estado:</Text>
            <Text style={styles.fieldValue}>{lead.status}</Text>
          </View>
          {lead.created_at && (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Creado:</Text>
              <Text style={styles.fieldValue}>{formatDate(lead.created_at)}</Text>
            </View>
          )}
        </View>

        <View style={styles.scoreBox}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreValue}>{lead.opportunity_score ?? "N/A"}</Text>
            <Text style={styles.scoreLabel}>Score AI</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreValue}>{contacts.length}</Text>
            <Text style={styles.scoreLabel}>Contactos</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreValue}>{lead.status}</Text>
            <Text style={styles.scoreLabel}>Estado</Text>
          </View>
        </View>

        {proposal && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Propuesta AI</Text>
            <Text style={{ fontSize: 10, lineHeight: 1.6, color: "#1a1a1a" }}>
              {proposal}
            </Text>
          </View>
        )}

        {contacts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historial de Contactos</Text>
            {contacts.map((contact) => (
              <View key={contact.id} style={styles.contactItem}>
                <View style={styles.contactHeader}>
                  <Text style={styles.contactType}>
                    {contact.contact_type}
                    {contact.status ? ` - ${contact.status}` : ""}
                  </Text>
                  <Text style={styles.contactDate}>
                    {formatDate(contact.created_at)}
                  </Text>
                </View>
                {contact.message && (
                  <Text style={styles.contactNotes}>{contact.message}</Text>
                )}
                {contact.sentiment && (
                  <Text style={{ fontSize: 8, color: "#6b7280", marginTop: 2 }}>
                    Sentimiento: {contact.sentiment}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text>Valencia Studio - Soluciones digitales</Text>
          <Text>Página 1</Text>
        </View>
      </Page>
    </Document>
  );
}
