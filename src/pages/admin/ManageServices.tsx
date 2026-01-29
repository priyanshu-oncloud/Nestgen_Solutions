import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

/* ---------- TYPES ---------- */
interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  keyPoints: string[];
}

const ManageServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const [current, setCurrent] = useState<Service>({
    id: "",
    title: "",
    description: "",
    icon: "",
    keyPoints: [""], // ✅ minimum 1
  });

  const { toast } = useToast();

  /* 🔄 FETCH SERVICES (REALTIME) */
  useEffect(() => {
    const servicesRef = ref(database, "services");

    return onValue(servicesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setServices([]);
        return;
      }

      const list: Service[] = Object.entries(data).map(
        ([id, value]: any) => ({
          id,
          ...value,
          keyPoints: value.keyPoints || [""],
        })
      );

      setServices(list.reverse());
    });
  }, []);

  /* ➕ ADD KEY POINT */
  const addKeyPoint = () => {
    if (current.keyPoints.length >= 4) return;
    setCurrent({
      ...current,
      keyPoints: [...current.keyPoints, ""],
    });
  };

  /* ➖ REMOVE KEY POINT */
  const removeKeyPoint = (index: number) => {
    if (current.keyPoints.length === 1) return;
    const updated = current.keyPoints.filter((_, i) => i !== index);
    setCurrent({ ...current, keyPoints: updated });
  };

  /* ✏ UPDATE KEY POINT */
  const updateKeyPoint = (index: number, value: string) => {
    const updated = [...current.keyPoints];
    updated[index] = value;
    setCurrent({ ...current, keyPoints: updated });
  };

  /* ➕➖ ADD / UPDATE SERVICE */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (current.id) {
        // UPDATE
        await update(ref(database, `services/${current.id}`), {
          title: current.title,
          description: current.description,
          icon: current.icon,
          keyPoints: current.keyPoints,
        });

        toast({ title: "Service updated successfully" });
      } else {
        // ADD
        await push(ref(database, "services"), {
          title: current.title,
          description: current.description,
          icon: current.icon,
          keyPoints: current.keyPoints,
          createdAt: Date.now(),
        });

        toast({ title: "Service added successfully" });
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

  /* ✏ EDIT */
  const handleEdit = (service: Service) => {
    setCurrent({
      ...service,
      keyPoints: service.keyPoints?.length
        ? service.keyPoints
        : [""],
    });
    setIsEditing(true);
  };

  /* 🗑 DELETE */
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    await remove(ref(database, `services/${id}`));
    toast({ title: "Service deleted successfully" });
  };

  /* 🔄 RESET FORM */
  const resetForm = () => {
    setCurrent({
      id: "",
      title: "",
      description: "",
      icon: "",
      keyPoints: [""],
    });
    setIsEditing(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Manage Services</h1>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          )}
        </div>

        {isEditing && (
          <Card>
            <CardHeader>
              <CardTitle>
                {current.id ? "Edit Service" : "Add New Service"}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* TITLE */}
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={current.title}
                    onChange={(e) =>
                      setCurrent({ ...current, title: e.target.value })
                    }
                    required
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={current.description}
                    onChange={(e) =>
                      setCurrent({
                        ...current,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    required
                  />
                </div>

                {/* KEY POINTS */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Key Points (min 1, max 4)
                  </label>

                  {current.keyPoints.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={point}
                        onChange={(e) =>
                          updateKeyPoint(index, e.target.value)
                        }
                        placeholder={`Key point ${index + 1}`}
                        required
                      />

                      {current.keyPoints.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeKeyPoint(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {current.keyPoints.length < 4 && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addKeyPoint}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Key Point
                    </Button>
                  )}
                </div>

                {/* ICON */}
                <div>
                  <label className="text-sm font-medium">
                    Icon (Lucide icon name)
                  </label>
                  <Input
                    value={current.icon}
                    onChange={(e) =>
                      setCurrent({ ...current, icon: e.target.value })
                    }
                    placeholder="e.g., Code2, Smartphone, Cloud"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="submit">Save</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        )}

        {/* SERVICES LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>

                <ul className="list-disc pl-4 text-sm text-muted-foreground">
                  {service.keyPoints?.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(service)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(service.id)}
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

export default ManageServices;
