import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SUBJECTS_DATA } from "./data";
import { FolderType } from "./types";



const RESOURCE_TYPES: { id: FolderType; label: string; icon: string; color: string }[] = [
  { id: "PYQs",        label: "PYQ",        icon: "file-document-multiple-outline", color: "#ef4444" },
  { id: "Notes",       label: "Notes",      icon: "notebook-outline",               color: "#22c55e" },
  { id: "Syllabus",    label: "Syllabus",   icon: "book-open-page-variant-outline", color: "#a855f7" },
  { id: "Assignments", label: "Assignment", icon: "clipboard-text-outline",         color: "#f97316" },
  { id: "Lab Manual",  label: "Lab Manual", icon: "flask-outline",                  color: "#3b82f6" },
];

const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];

const BRANCHES = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Mathematics",
  "Physics",
  "Information Technology",
  "Chemical Engineering",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadForm {
  subject: string;
  branch: string;
  semester: string;
  resourceType: FolderType | "";
  title: string;
  description: string;
  year: string;       
  fileName: string;   
}

interface AcademicsUploadSheetProps {
  visible: boolean;
  onClose: () => void;
  prefillSubject?: string;
  prefillResourceType?: FolderType;
  onUploaded?: (data: UploadForm) => void;
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 5, alignSelf: "center", marginBottom: 22 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i === current ? "#FF6B35" : "#27272a",
          }}
        />
      ))}
    </View>
  );
}

// ─── Pill selector ────────────────────────────────────────────────────────────

function PillRow<T extends string>({
  items,
  selected,
  onSelect,
  color = "#FF6B35",
}: {
  items: { id: T; label: string }[];
  selected: T;
  onSelect: (id: T) => void;
  color?: string;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: "row", gap: 8, paddingRight: 8 }}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.75 : 1,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: selected === item.id ? color : "#18181b",
              borderWidth: 1,
              borderColor: selected === item.id ? color : "rgba(255,255,255,0.07)",
            })}
          >
            <Text
              style={{
                color: selected === item.id ? "#fff" : "#71717a",
                fontWeight: "700",
                fontSize: 13,
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Main sheet ───────────────────────────────────────────────────────────────

export default function AcademicsUploadSheet({
  visible,
  onClose,
  prefillSubject = "",
  prefillResourceType,
  onUploaded,
}: AcademicsUploadSheetProps) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<UploadForm>({
    subject: prefillSubject,
    branch: prefillSubject || "",
    semester: "",
    resourceType: prefillResourceType ?? "",
    title: "",
    description: "",
    year: "",
    fileName: "",
  });

  const set = (key: keyof UploadForm, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const reset = () => {
    setStep(0);
    setSubmitted(false);
    setForm({
      subject: prefillSubject,
      branch: prefillSubject || "",
      semester: "",
      resourceType: prefillResourceType ?? "",
      title: "",
      description: "",
      year: "",
      fileName: "",
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const canGoNext = () => {
    if (step === 0) return !!form.branch && !!form.semester && !!form.resourceType;
    if (step === 1) return !!form.title;
    return true;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    onUploaded?.(form);
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const selectedType = RESOURCE_TYPES.find((r) => r.id === form.resourceType);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Contribute Resource</Text>
              <Text style={styles.headerSub}>Help the community learn better</Text>
            </View>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.6 : 1 }]}
            >
              <MaterialCommunityIcons name="close" size={18} color="#71717a" />
            </Pressable>
          </View>

          {/* Success state */}
          {submitted ? (
            <View style={styles.successBox}>
              <View style={styles.successCircle}>
                <MaterialCommunityIcons name="check-bold" size={32} color="#22c55e" />
              </View>
              <Text style={styles.successTitle}>Uploaded!</Text>
              <Text style={styles.successSub}>
                Your resource has been submitted and will appear in{" "}
                <Text style={{ color: "#fff", fontWeight: "700" }}>{form.branch}</Text> →{" "}
                <Text style={{ color: selectedType?.color ?? "#FF6B35", fontWeight: "700" }}>
                  {form.resourceType}
                </Text>.
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
            >
              <StepDots current={step} total={3} />

              {/* ── Step 0: Subject + Type ── */}
              {step === 0 && (
                <View>
                  <Text style={styles.fieldLabel}>Branch / Course</Text>
                  <PillRow
                    items={BRANCHES.map((b) => ({ id: b, label: b.replace(" Engineering", "").replace(" Science", " Sci") }))}
                    selected={form.branch}
                    onSelect={(v) => set("branch", v)}
                  />

                  <Text style={styles.fieldLabel}>Semester</Text>
                  <PillRow
                    items={SEMESTERS.map((s) => ({ id: s, label: `Sem ${s}` }))}
                    selected={form.semester}
                    onSelect={(v) => set("semester", v)}
                  />

                  <Text style={styles.fieldLabel}>Resource Type</Text>
                  <View style={styles.typeGrid}>
                    {RESOURCE_TYPES.map((rt) => (
                      <Pressable
                        key={rt.id}
                        onPress={() => set("resourceType", rt.id)}
                        style={({ pressed }) => [
                          styles.typeCard,
                          form.resourceType === rt.id && {
                            borderColor: rt.color,
                            backgroundColor: `${rt.color}12`,
                          },
                          { opacity: pressed ? 0.75 : 1 },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={rt.icon as any}
                          size={22}
                          color={form.resourceType === rt.id ? rt.color : "#52525b"}
                        />
                        <Text
                          style={[
                            styles.typeLabel,
                            form.resourceType === rt.id && { color: rt.color },
                          ]}
                        >
                          {rt.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* ── Step 1: Title + Description ── */}
              {step === 1 && (
                <View>
                  <Text style={styles.fieldLabel}>Resource Title *</Text>
                  <TextInput
                    value={form.title}
                    onChangeText={(v) => set("title", v)}
                    placeholder="e.g. Data Structures PYQ 2024"
                    placeholderTextColor="#52525b"
                    style={styles.input}
                    autoFocus
                  />

                  {form.resourceType === "PYQs" && (
                    <>
                      <Text style={styles.fieldLabel}>Exam Year</Text>
                      <PillRow
                        items={["2024","2023","2022","2021","2020"].map((y) => ({ id: y, label: y }))}
                        selected={form.year}
                        onSelect={(v) => set("year", v)}
                        color="#ef4444"
                      />
                    </>
                  )}

                  <Text style={styles.fieldLabel}>Description (optional)</Text>
                  <TextInput
                    value={form.description}
                    onChangeText={(v) => set("description", v)}
                    placeholder="Brief note about this resource..."
                    placeholderTextColor="#52525b"
                    multiline
                    numberOfLines={3}
                    style={[styles.input, styles.textArea]}
                  />
                </View>
              )}

              {/* ── Step 2: File upload ── */}
              {step === 2 && (
                <View>
                  <Text style={styles.fieldLabel}>Attach File</Text>

                  {/* Mock file picker */}
                  <Pressable
                    onPress={() => set("fileName", "document_" + Date.now() + ".pdf")}
                    style={({ pressed }) => [
                      styles.filePicker,
                      form.fileName && styles.filePickerFilled,
                      { opacity: pressed ? 0.8 : 1 },
                    ]}
                  >
                    {form.fileName ? (
                      <View style={{ alignItems: "center", gap: 8 }}>
                        <MaterialCommunityIcons
                          name="file-check-outline"
                          size={36}
                          color="#22c55e"
                        />
                        <Text style={styles.fileNameText}>{form.fileName}</Text>
                        <Text style={styles.fileSizeText}>Ready to upload</Text>
                      </View>
                    ) : (
                      <View style={{ alignItems: "center", gap: 8 }}>
                        <MaterialCommunityIcons
                          name="cloud-upload-outline"
                          size={36}
                          color="#52525b"
                        />
                        <Text style={styles.filePickerLabel}>Tap to select file</Text>
                        <Text style={styles.filePickerSub}>PDF, DOC, JPG, PNG · Max 20 MB</Text>
                      </View>
                    )}
                  </Pressable>

                  {/* Summary card */}
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Summary</Text>
                    {[
                      { label: "Branch", val: form.branch },
                      { label: "Semester", val: `Semester ${form.semester}` },
                      { label: "Type", val: form.resourceType },
                      { label: "Title", val: form.title },
                    ].map((row) => (
                      <View key={row.label} style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>{row.label}</Text>
                        <Text style={styles.summaryVal}>{row.val || "—"}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          )}

          {/* ── Footer buttons ── */}
          {!submitted && (
            <View style={styles.footer}>
              {step > 0 && (
                <Pressable
                  onPress={() => setStep((s) => s - 1)}
                  style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <MaterialCommunityIcons name="arrow-left" size={18} color="#a1a1aa" />
                  <Text style={styles.backBtnText}>Back</Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => {
                  if (step < 2) setStep((s) => s + 1);
                  else handleSubmit();
                }}
                disabled={!canGoNext()}
                style={({ pressed }) => [
                  styles.nextBtn,
                  { flex: step > 0 ? 1 : undefined, opacity: pressed ? 0.85 : canGoNext() ? 1 : 0.4 },
                ]}
              >
                <Text style={styles.nextBtnText}>
                  {step === 2 ? "Upload Resource" : "Continue"}
                </Text>
                <MaterialCommunityIcons
                  name={step === 2 ? "cloud-upload" : "arrow-right"}
                  size={16}
                  color="#fff"
                />
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  container: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#111",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
    maxHeight: "90%",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#27272a",
    alignSelf: "center",
    marginBottom: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerTitle: { color: "#fff", fontWeight: "800", fontSize: 20 },
  headerSub: { color: "#71717a", fontSize: 12, marginTop: 2 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#18181b",
    alignItems: "center",
    justifyContent: "center",
  },

  // Fields
  fieldLabel: {
    color: "#71717a",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
    marginTop: 4,
  },
  input: {
    backgroundColor: "#18181b",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 14,
    color: "#fff",
    fontSize: 14,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },

  // Type grid
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  typeCard: {
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.07)",
    backgroundColor: "#18181b",
    gap: 6,
  },
  typeLabel: { color: "#52525b", fontSize: 11, fontWeight: "700", textAlign: "center" },

  // File picker
  filePicker: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#27272a",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    marginBottom: 20,
  },
  filePickerFilled: {
    borderStyle: "solid",
    borderColor: "#22c55e",
    backgroundColor: "rgba(34,197,94,0.06)",
  },
  filePickerLabel: { color: "#a1a1aa", fontWeight: "600", fontSize: 14 },
  filePickerSub: { color: "#52525b", fontSize: 12 },
  fileNameText: { color: "#22c55e", fontWeight: "700", fontSize: 13 },
  fileSizeText: { color: "#52525b", fontSize: 11 },

  // Summary
  summaryCard: {
    backgroundColor: "#18181b",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: 14,
  },
  summaryTitle: {
    color: "#71717a",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  summaryLabel: { color: "#52525b", fontSize: 12 },
  summaryVal: { color: "#d4d4d8", fontSize: 12, fontWeight: "600", maxWidth: "60%", textAlign: "right" },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingTop: 16,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  backBtnText: { color: "#a1a1aa", fontWeight: "700", fontSize: 14 },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: "#FF6B35",
    width: "100%",
  },
  nextBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },

  // Success
  successBox: { alignItems: "center", paddingVertical: 32, gap: 12 },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(34,197,94,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: { color: "#fff", fontWeight: "800", fontSize: 22 },
  successSub: { color: "#71717a", fontSize: 13, textAlign: "center", lineHeight: 20 },
});