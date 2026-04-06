"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2, BedDouble, Users, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface RoomPageProps {
  params: Promise<{ id: string }>;
}

interface Room {
  id: string;
  name: string;
  room_type: string;
  capacity: number;
  base_price_cents: number;
  description: string | null;
  is_active: boolean;
}

export default function RoomsPage({ params }: RoomPageProps) {
  const supabase = createClient();
  const [hostelId, setHostelId] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newRoom, setNewRoom] = useState({
    name: "",
    room_type: "dorm",
    capacity: 8,
    base_price_cents: 1200,
    description: "",
  });

  const loadRooms = useCallback(async (id: string) => {
    const { data } = await supabase
      .from("rooms")
      .select("*")
      .eq("hostel_id", id)
      .order("created_at");
    if (data) setRooms(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    params.then(({ id }) => {
      setHostelId(id);
      loadRooms(id);
    });
  }, [params, loadRooms]);

  const handleAddRoom = async () => {
    setSaving(true);
    const res = await fetch(`/api/hostels/${hostelId}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRoom),
    });

    if (res.ok) {
      toast.success("Room added!");
      setDialogOpen(false);
      setNewRoom({ name: "", room_type: "dorm", capacity: 8, base_price_cents: 1200, description: "" });
      loadRooms(hostelId);
    } else {
      toast.error("Failed to add room");
    }
    setSaving(false);
  };

  const toggleRoom = async (roomId: string, isActive: boolean) => {
    await supabase
      .from("rooms")
      .update({ is_active: !isActive })
      .eq("id", roomId);
    loadRooms(hostelId);
    toast.success(isActive ? "Room deactivated" : "Room activated");
  };

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button><Plus className="h-4 w-4 mr-1" /> Add Room</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Room Name</Label>
                <Input
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="e.g., 8-Bed Mixed Dorm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <Select
                    value={newRoom.room_type}
                    onValueChange={(v) => setNewRoom({ ...newRoom, room_type: v ?? "dorm" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dorm">Dorm</SelectItem>
                      <SelectItem value="female_dorm">Female Dorm</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Capacity (beds)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Price per night (EUR)</Label>
                <Input
                  type="number"
                  min={1}
                  step={0.5}
                  value={newRoom.base_price_cents / 100}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, base_price_cents: Math.round(Number(e.target.value) * 100) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  placeholder="Bunk beds, personal reading light, power outlets..."
                  rows={3}
                />
              </div>
              <Button onClick={handleAddRoom} disabled={saving || !newRoom.name} className="w-full">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Room
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {rooms.map((room) => (
          <Card key={room.id} className={!room.is_active ? "opacity-50" : ""}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4" />
                  <h3 className="font-semibold">{room.name}</h3>
                  {!room.is_active && <Badge variant="secondary">Inactive</Badge>}
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {room.capacity} beds
                  </span>
                  <Badge variant="outline">{room.room_type}</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">&euro;{(room.base_price_cents / 100).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">/night</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleRoom(room.id, room.is_active)}
              >
                {room.is_active ? "Deactivate" : "Activate"}
              </Button>
            </CardContent>
          </Card>
        ))}
        {rooms.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No rooms yet. Add your first room to start receiving bookings.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
