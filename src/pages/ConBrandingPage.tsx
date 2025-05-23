import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { MainHeader } from "@/components/header/MainHeader";
import { MainSidebar } from "@/components/layout/MainSidebar";
import { ChromePicker } from 'react-color';
import { safeStringCast } from '@/utils/typeGuards';

export const ConBrandingPage = () => {
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#007BFF");
  const [secondaryColor, setSecondaryColor] = useState("#6C757D");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('branding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setLogoUrl(safeStringCast(data.logo_url));
        setPrimaryColor(safeStringCast(data.primary_color));
        setSecondaryColor(safeStringCast(data.secondary_color));
        setCompanyName(safeStringCast(data.company_name));
        setDescription(safeStringCast(data.description));
      }
    } catch (error) {
      console.error('Error loading branding:', error);
      toast({
        title: "Error loading branding",
        description: "Using default branding",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const brandingData = {
        user_id: user.id,
        logo_url: safeStringCast(logoUrl),
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        company_name: companyName,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('branding')
        .upsert(brandingData);

      if (error) throw error;

      toast({
        title: "Branding saved",
        description: "Your branding preferences have been updated successfully"
      });
    } catch (error) {
      console.error('Error saving branding:', error);
      toast({
        title: "Error saving branding",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MainSidebar />
      <div className="pl-64">
        <MainHeader />
        <div className="p-6">
          <h1 className="text-3xl font-semibold mb-4">
            Customize Your Branding
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              <div className="mb-4">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  type="text"
                  id="logoUrl"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="Enter logo URL"
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter company description"
                  rows={4}
                />
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="mb-4">
                <Label>Primary Color</Label>
                <ChromePicker
                  color={primaryColor}
                  onChangeComplete={(color) => setPrimaryColor(color.hex)}
                />
              </div>

              <div className="mb-4">
                <Label>Secondary Color</Label>
                <ChromePicker
                  color={secondaryColor}
                  onChangeComplete={(color) => setSecondaryColor(color.hex)}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Loading..." : "Save Branding"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConBrandingPage;
