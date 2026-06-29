const fs = require("fs")

const updates = [
  {
    path: "src/pages/Cycles.tsx",
    replacements: [
      ['import ActionNotice,\r\n  type StatusMessage,\r\n} from "@/components/common/ActionNotice"\r\n', 'import { toast } from "@/lib/toast"\r\n'],
      ['  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)\r\n', ''],
      ['    setStatusMessage(null)\r\n\r\n', ''],
      ['        setStatusMessage({\r\n          tone: "success",\r\n          text: "تم إنشاء الدورة الجديدة بنجاح.",\r\n        })', '        toast.success("تم إنشاء الدورة الجديدة بنجاح.")'],
      ['        setStatusMessage({\r\n          tone: "error",\r\n          text: error instanceof Error ? error.message : "تعذر إنشاء الدورة.",\r\n        })', '        toast.error(error instanceof Error ? error.message : "تعذر إنشاء الدورة.")'],
      ['      <ActionNotice message={statusMessage} />\r\n\r\n', ''],
    ],
  },
  {
    path: "src/pages/DailyLogs.tsx",
    replacements: [
      ['import ActionNotice,\r\n  type StatusMessage,\r\n} from "@/components/common/ActionNotice"\r\n', 'import { toast } from "@/lib/toast"\r\n'],
      ['  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)\r\n', ''],
      ['    setStatusMessage(null)\r\n\r\n', ''],
      ['        setStatusMessage({ tone: "success", text: "تمت إضافة السجل اليومي." })', '        toast.success("تمت إضافة السجل اليومي.")'],
      ['        setStatusMessage({\r\n          tone: "error",\r\n          text:\r\n            error instanceof Error ? error.message : "تعذر حفظ السجل اليومي.",\r\n        })', '        toast.error(\r\n          error instanceof Error ? error.message : "تعذر حفظ السجل اليومي."\r\n        )'],
      ['      <ActionNotice message={statusMessage} />\r\n\r\n', ''],
    ],
  },
  {
    path: "src/pages/FeedPurchases.tsx",
    replacements: [
      ['import ActionNotice,\r\n  type StatusMessage,\r\n} from "@/components/common/ActionNotice"\r\n', 'import { toast } from "@/lib/toast"\r\n'],
      ['  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)\r\n', ''],
      ['    setStatusMessage(null)\r\n\r\n', ''],
      ['        setStatusMessage({ tone: "success", text: "تم تسجيل شراء العلف." })', '        toast.success("تم تسجيل شراء العلف.")'],
      ['        setStatusMessage({\r\n          tone: "error",\r\n          text:\r\n            error instanceof Error ? error.message : "تعذر تسجيل شراء العلف.",\r\n        })', '        toast.error(\r\n          error instanceof Error ? error.message : "تعذر تسجيل شراء العلف."\r\n        )'],
      ['      <ActionNotice message={statusMessage} />\r\n\r\n', ''],
    ],
  },
  {
    path: "src/pages/WeightLogs.tsx",
    replacements: [
      ['import ActionNotice,\r\n  type StatusMessage,\r\n} from "@/components/common/ActionNotice"\r\n', 'import { toast } from "@/lib/toast"\r\n'],
      ['  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)\r\n', ''],
      ['    setStatusMessage(null)\r\n\r\n', ''],
      ['        setStatusMessage({ tone: "success", text: "تم حفظ قراءة الوزن." })', '        toast.success("تم حفظ قراءة الوزن.")'],
      ['        setStatusMessage({\r\n          tone: "error",\r\n          text: error instanceof Error ? error.message : "تعذر حفظ الوزن.",\r\n        })', '        toast.error(error instanceof Error ? error.message : "تعذر حفظ الوزن.")'],
      ['      <ActionNotice message={statusMessage} />\r\n\r\n', ''],
    ],
  },
  {
    path: "src/pages/Expenses.tsx",
    replacements: [
      ['import ActionNotice,\r\n  type StatusMessage,\r\n} from "@/components/common/ActionNotice"\r\n', 'import { toast } from "@/lib/toast"\r\n'],
      ['  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)\r\n', ''],
      ['    setStatusMessage(null)\r\n\r\n', ''],
      ['        setStatusMessage({ tone: "success", text: "تمت إضافة المصروف بنجاح." })', '        toast.success("تمت إضافة المصروف بنجاح.")'],
      ['        setStatusMessage({\r\n          tone: "error",\r\n          text: error instanceof Error ? error.message : "تعذر حفظ المصروف.",\r\n        })', '        toast.error(error instanceof Error ? error.message : "تعذر حفظ المصروف.")'],
      ['      <ActionNotice message={statusMessage} />\r\n\r\n', ''],
    ],
  },
  {
    path: "src/pages/Sales.tsx",
    replacements: [
      ['import ActionNotice,\r\n  type StatusMessage,\r\n} from "@/components/common/ActionNotice"\r\n', 'import { toast } from "@/lib/toast"\r\n'],
      ['  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)\r\n', ''],
      ['    setStatusMessage(null)\r\n\r\n', ''],
      ['        setStatusMessage({ tone: "success", text: "تم تسجيل عملية البيع." })', '        toast.success("تم تسجيل عملية البيع.")'],
      ['        setStatusMessage({\r\n          tone: "error",\r\n          text: error instanceof Error ? error.message : "تعذر تسجيل البيع.",\r\n        })', '        toast.error(error instanceof Error ? error.message : "تعذر تسجيل البيع.")'],
      ['      <ActionNotice message={statusMessage} />\r\n\r\n', ''],
    ],
  },
  {
    path: "src/pages/Settings.tsx",
    replacements: [
      ['import ActionNotice,\r\n  type StatusMessage,\r\n} from "@/components/common/ActionNotice"\r\n', 'import { toast } from "@/lib/toast"\r\n'],
      ['  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)\r\n', ''],
      ['    setStatusMessage({ tone: "success", text: "تم حفظ الإعدادات المحلية للواجهة." })', '    toast.success("تم حفظ الإعدادات المحلية للواجهة.")'],
      ['      <ActionNotice message={statusMessage} />\r\n\r\n', ''],
    ],
  },
  {
    path: "src/pages/MedicationLogs.tsx",
    replacements: [
      ['import ActionNotice,\r\n  type StatusMessage,\r\n} from "@/components/common/ActionNotice"\r\n', 'import { toast } from "@/lib/toast"\r\n'],
      ['  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)\r\n', ''],
      ['    setStatusMessage(null)\r\n\r\n', ''],
      ['        setStatusMessage({ tone: "success", text: "تم حفظ سجل الدواء." })', '        toast.success("تم حفظ سجل الدواء.")'],
      ['        setStatusMessage({\r\n          tone: "error",\r\n          text: error instanceof Error ? error.message : "تعذر حفظ سجل الدواء.",\r\n        })', '        toast.error(error instanceof Error ? error.message : "تعذر حفظ سجل الدواء.")'],
      ['      <ActionNotice message={statusMessage} />\r\n\r\n', ''],
    ],
  },
]

for (const update of updates) {
  let content = fs.readFileSync(update.path, "utf8")
  for (const [from, to] of update.replacements) {
    if (!content.includes(from)) {
      throw new Error(`Snippet not found in ${update.path}: ${from.slice(0, 80)}`)
    }
    content = content.replace(from, to)
  }
  fs.writeFileSync(update.path, content, "utf8")
}
