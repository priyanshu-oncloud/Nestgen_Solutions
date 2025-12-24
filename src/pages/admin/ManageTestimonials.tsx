import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import {
  ref,
  push,
  onValue,
  update,
  remove,
} from "firebase/database";
import { database } from "@/firebase";

interface Testimonial {
  id: string;
  clientName: string;
  company: string;
  message: string;
  rating: number;
}

const ManageTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<Testimonial>({
    id: "",
    clientName: "",
    company: "",
    message: "",
    rating: 5,
  });

  const { toast } = useToast();

  /* 🔄 Fetch Testimonials (Realtime) */
  useEffect(() => {
    const testimonialsRef = ref(database, "testimonials");

    return onValue(testimonialsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setTestimonials([]);
        return;
      }

      const list: Testimonial[] = Object.entries(data).map(
        ([id, value]: any) => ({
          id,
          ...value,
        })
      );

      setTestimonials(list.reverse());
    });
  }, []);

  /* ➕➖ Save / Update */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (current.id) {
        // Update
        await update(ref(database, `testimonials/${current.id}`), {
          clientName: current.clientName,
          company: current.company,
          message: current.message,
          rating: current.rating,
        });

        toast({ title: "Testimonial updated" });
      } else {
        // Add
        await push(ref(database, "testimonials"), {
          clientName: current.clientName,
          company: current.company,
          message: current.message,
          rating: current.rating,
          createdAt: Date.now(),
        });

        toast({ title: "Testimonial added" });
      }

      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  /* ✏ Edit */
  const handleEdit = (t: Testimonial) => {
    setCurrent(t);
    setIsEditing(true);
  };

  /* 🗑 Delete */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;

    await remove(ref(database, `testimonials/${id}`));
    toast({ title: "Testimonial deleted" });
  };

  const resetForm = () => {
    setCurrent({
      id: "",
      clientName: "",
      company: "",
      message: "",
      rating: 5,
    });
    setIsEditing(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Manage Testimonials</h1>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          )}
        </div>

        {isEditing && (
          <Card>
            <CardHeader>
              <CardTitle>
                {current.id ? "Edit Testimonial" : "Add Testimonial"}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Client Name</label>
                  <Input
                    value={current.clientName}
                    onChange={(e) =>
                      setCurrent({ ...current, clientName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Company</label>
                  <Input
                    value={current.company}
                    onChange={(e) =>
                      setCurrent({ ...current, company: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={current.message}
                    onChange={(e) =>
                      setCurrent({ ...current, message: e.target.value })
                    }
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Rating (1-5)</label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={current.rating}
                    onChange={(e) =>
                      setCurrent({
                        ...current,
                        rating: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">Save</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <Card key={t.id}>
              <CardHeader>
                <CardTitle>{t.clientName}</CardTitle>
                <p className="text-sm text-muted-foreground">{t.company}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  {"⭐".repeat(t.rating)}
                </div>

                <p className="text-sm">{t.message}</p>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(t)}>
                    <Pencil className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(t.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
};

export default ManageTestimonials;
