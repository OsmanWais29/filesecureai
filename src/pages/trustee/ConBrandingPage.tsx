
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Palette, 
  Upload, 
  Monitor, 
  Smartphone,
  Eye,
  Save,
  RotateCcw
} from "lucide-react";

const TrusteeConBrandingPage = () => {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Branding & Customization</h1>
            <p className="text-gray-600 mt-1">Customize the client portal with your firm's branding.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Branding Settings */}
          <div className="space-y-6">
            {/* Logo Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Logo & Branding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="logo-upload">Company Logo</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Drop your logo here or <span className="text-blue-500 cursor-pointer">browse files</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: PNG, JPG, SVG (max 2MB)
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input 
                    id="company-name" 
                    placeholder="Your Firm Name"
                    defaultValue="Smith & Associates Trustees"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tagline">Tagline (Optional)</Label>
                  <Input 
                    id="tagline" 
                    placeholder="Your professional tagline"
                    defaultValue="Trusted Bankruptcy Solutions"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Color Scheme */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Color Scheme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input 
                        id="primary-color" 
                        type="color" 
                        defaultValue="#2563eb"
                        className="w-16 h-10 p-1"
                      />
                      <Input 
                        placeholder="#2563eb" 
                        defaultValue="#2563eb"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input 
                        id="secondary-color" 
                        type="color" 
                        defaultValue="#64748b"
                        className="w-16 h-10 p-1"
                      />
                      <Input 
                        placeholder="#64748b" 
                        defaultValue="#64748b"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Preset Color Schemes</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {[
                      { name: "Professional Blue", primary: "#2563eb", secondary: "#64748b" },
                      { name: "Corporate Gray", primary: "#374151", secondary: "#9ca3af" },
                      { name: "Trustee Green", primary: "#059669", secondary: "#6b7280" },
                      { name: "Financial Gold", primary: "#d97706", secondary: "#78716c" }
                    ].map((scheme, index) => (
                      <div key={index} className="p-2 border rounded cursor-pointer hover:border-blue-500">
                        <div className="flex gap-1 mb-1">
                          <div 
                            className="w-4 h-4 rounded" 
                            style={{ backgroundColor: scheme.primary }}
                          ></div>
                          <div 
                            className="w-4 h-4 rounded" 
                            style={{ backgroundColor: scheme.secondary }}
                          ></div>
                        </div>
                        <p className="text-xs">{scheme.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custom CSS */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Customization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="custom-css">Custom CSS</Label>
                  <textarea 
                    id="custom-css"
                    className="w-full h-32 p-3 border rounded-md font-mono text-sm"
                    placeholder="Add custom CSS rules here..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Advanced users can add custom CSS to further customize the appearance.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Default
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Desktop Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  {/* Mock client portal header */}
                  <div className="bg-blue-600 text-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">SA</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">Smith & Associates</h3>
                          <p className="text-xs opacity-90">Client Portal</p>
                        </div>
                      </div>
                      <div className="text-sm">Welcome, John Doe</div>
                    </div>
                  </div>
                  
                  {/* Mock content */}
                  <div className="p-4 bg-gray-50">
                    <div className="bg-white rounded p-4 mb-4">
                      <h4 className="font-semibold mb-2">Your Case Status</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Consumer Proposal</span>
                          <span className="text-green-600">In Progress</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Next Payment Due</span>
                          <span>January 25, 2025</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded p-4">
                      <h4 className="font-semibold mb-2">Recent Documents</h4>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">Form 47 - Consumer Proposal</div>
                        <div className="text-sm text-gray-600">Statement of Affairs</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Mobile Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-sm mx-auto border rounded-lg overflow-hidden">
                  {/* Mock mobile client portal */}
                  <div className="bg-blue-600 text-white p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-xs">SA</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">Smith & Associates</h3>
                        <p className="text-xs opacity-90">Client Portal</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50">
                    <div className="bg-white rounded p-3 mb-3">
                      <h4 className="text-sm font-semibold mb-2">Case Status</h4>
                      <div className="text-xs text-gray-600">Consumer Proposal - In Progress</div>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <h4 className="text-sm font-semibold mb-2">Quick Actions</h4>
                      <div className="space-y-1">
                        <div className="text-xs text-blue-600">View Documents</div>
                        <div className="text-xs text-blue-600">Make Payment</div>
                        <div className="text-xs text-blue-600">Contact Trustee</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TrusteeConBrandingPage;
