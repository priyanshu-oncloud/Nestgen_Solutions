import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

const FormSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/submissions");
      const data = await res.json();
      setSubmissions(data);
    } catch (error) {
      console.error("Failed to fetch submissions", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ EXCELJS LAZY LOAD (LEGACY JS FIX)
  const exportToExcel = async () => {
    const ExcelJS = await import("exceljs");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Form Submissions");

    worksheet.columns = [
      { header: "ID", key: "id", width: 25 },
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Message", key: "message", width: 40 },
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    submissions.forEach((item) => {
      worksheet.addRow({
        id: item.id,
        name: item.name,
        email: item.email,
        message: item.message,
        createdAt: new Date(item.createdAt).toLocaleString(),
      });
    });

    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "form-submissions.xlsx";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Form Submissions</CardTitle>
          <Button onClick={exportToExcel} disabled={submissions.length === 0}>
            Export Excel
          </Button>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : submissions.length === 0 ? (
            <p className="text-muted-foreground">No submissions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Message</th>
                    <th className="p-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{item.name}</td>
                      <td className="p-3">{item.email}</td>
                      <td className="p-3">{item.message}</td>
                      <td className="p-3">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FormSubmissions;
