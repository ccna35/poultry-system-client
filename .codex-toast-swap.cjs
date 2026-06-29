const fs = require("fs")

const files = {
  "src/pages/Cycles.tsx": {
    success: [/setStatusMessage\(\{\s*tone: "success",\s*text: "تم إنشاء الدورة الجديدة بنجاح\.",\s*\}\)/, 'toast.success("تم إنشاء الدورة الجديدة بنجاح.")'],
    error: [/setStatusMessage\(\{\s*tone: "error",\s*text: error instanceof Error \? error\.message : "تعذر إنشاء الدورة\.",\s*\}\)/, 'toast.error(error instanceof Error ? error.message : "تعذر إنشاء الدورة.")'],
  },
  "src/pages/DailyLogs.tsx": {
    success: [/setStatusMessage\(\{ tone: "success", text: "تمت إضافة السجل اليومي\." \}\)/, 'toast.success("تمت إضافة السجل اليومي.")'],
    error: [/setStatusMessage\(\{\s*tone: "error",\s*text:\s*error instanceof Error \? error\.message : "تعذر حفظ السجل اليومي\.",\s*\}\)/, 'toast.error(error instanceof Error ? error.message : "تعذر حفظ السجل اليومي.")'],
  },
  "src/pages/FeedPurchases.tsx": {
    success: [/setStatusMessage\(\{ tone: "success", text: "تم تسجيل شراء العلف\." \}\)/, 'toast.success("تم تسجيل شراء العلف.")'],
    error: [/setStatusMessage\(\{\s*tone: "error",\s*text:\s*error instanceof Error \? error\.message : "تعذر تسجيل شراء العلف\.",\s*\}\)/, 'toast.error(error instanceof Error ? error.message : "تعذر تسجيل شراء العلف.")'],
  },
  "src/pages/WeightLogs.tsx": {
    success: [/setStatusMessage\(\{ tone: "success", text: "تم حفظ قراءة الوزن\." \}\)/, 'toast.success("تم حفظ قراءة الوزن.")'],
    error: [/setStatusMessage\(\{\s*tone: "error",\s*text: error instanceof Error \? error\.message : "تعذر حفظ الوزن\.",\s*\}\)/, 'toast.error(error instanceof Error ? error.message : "تعذر حفظ الوزن.")'],
  },
  "src/pages/Expenses.tsx": {
    success: [/setStatusMessage\(\{ tone: "success", text: "تمت إضافة المصروف بنجاح\." \}\)/, 'toast.success("تمت إضافة المصروف بنجاح.")'],
    error: [/setStatusMessage\(\{\s*tone: "error",\s*text: error instanceof Error \? error\.message : "تعذر حفظ المصروف\.",\s*\}\)/, 'toast.error(error instanceof Error ? error.message : "تعذر حفظ المصروف.")'],
  },
  "src/pages/Sales.tsx": {
    success: [/setStatusMessage\(\{ tone: "success", text: "تم تسجيل عملية البيع\." \}\)/, 'toast.success("تم تسجيل عملية البيع.")'],
    error: [/setStatusMessage\(\{\s*tone: "error",\s*text: error instanceof Error \? error\.message : "تعذر تسجيل البيع\.",\s*\}\)/, 'toast.error(error instanceof Error ? error.message : "تعذر تسجيل البيع.")'],
  },
  "src/pages/Settings.tsx": {
    success: [/setStatusMessage\(\{\s*tone: "success",\s*text: "تم حفظ الإعدادات المحلية للواجهة\.",\s*\}\)/, 'toast.success("تم حفظ الإعدادات المحلية للواجهة.")'],
  },
  "src/pages/MedicationLogs.tsx": {
    success: [/setStatusMessage\(\{ tone: "success", text: "تم حفظ سجل الدواء\." \}\)/, 'toast.success("تم حفظ سجل الدواء.")'],
    error: [/setStatusMessage\(\{\s*tone: "error",\s*text: error instanceof Error \? error\.message : "تعذر حفظ سجل الدواء\.",\s*\}\)/, 'toast.error(error instanceof Error ? error.message : "تعذر حفظ سجل الدواء.")'],
  },
}

for (const [path, replacements] of Object.entries(files)) {
  let content = fs.readFileSync(path, "utf8")

  content = content.replace(
    /import ActionNotice,\s*\{\s*type StatusMessage,\s*\}\s*from "@\/components\/common\/ActionNotice"\s*/,
    'import { toast } from "@/lib/toast"\n'
  )
  content = content.replace(
    /\s*const \[statusMessage, setStatusMessage\] = useState<StatusMessage \| null>\(null\)\n/,
    '\n'
  )
  content = content.replace(/\s*setStatusMessage\(null\)\n\n/g, '\n')
  content = content.replace(/\s*<ActionNotice message=\{statusMessage\} \/>\n\n/g, '\n')

  if (!replacements.success[0].test(content)) {
    throw new Error(`Success snippet not found in ${path}`)
  }
  content = content.replace(replacements.success[0], replacements.success[1])

  if (replacements.error) {
    if (!replacements.error[0].test(content)) {
      throw new Error(`Error snippet not found in ${path}`)
    }
    content = content.replace(replacements.error[0], replacements.error[1])
  }

  fs.writeFileSync(path, content, "utf8")
}
