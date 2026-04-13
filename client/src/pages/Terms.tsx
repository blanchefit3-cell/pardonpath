import { useEffect } from "react";

export default function Terms() {
  useEffect(() => {
    document.title = "Terms of Service | PardonPath";
    document.head.appendChild(
      Object.assign(document.createElement("meta"), {
        name: "description",
        content: "PardonPath Terms of Service - Legal terms and conditions for using our platform.",
      })
    );
  }, []);

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="container mx-auto max-w-4xl prose prose-invert">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">
          <strong>Last Updated:</strong> April 13, 2026
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4 text-foreground">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground mb-4">
          By accessing and using PardonPath, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4 text-foreground">2. Use License</h2>
        <p className="text-muted-foreground mb-4">
          Permission is granted to temporarily download one copy of the materials (information or software) on PardonPath for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
        </p>
        <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
          <li>Modifying or copying the materials</li>
          <li>Using the materials for any commercial purpose or for any public display</li>
          <li>Attempting to decompile or reverse engineer any software contained on PardonPath</li>
          <li>Removing any copyright or other proprietary notations from the materials</li>
          <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
        </ul>

        <h2 className="text-2xl font-bold mt-12 mb-4 text-foreground">3. Disclaimer</h2>
        <p className="text-muted-foreground mb-4">
          The materials on PardonPath are provided on an 'as is' basis. PardonPath makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4 text-foreground">4. Limitations</h2>
        <p className="text-muted-foreground mb-4">
          In no event shall PardonPath or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PardonPath, even if PardonPath or a PardonPath authorized representative has been notified orally or in writing of the possibility of such damage.
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4 text-foreground">5. Accuracy of Materials</h2>
        <p className="text-muted-foreground mb-4">
          The materials appearing on PardonPath could include technical, typographical, or photographic errors. PardonPath does not warrant that any of the materials on its website are accurate, complete, or current. PardonPath may make changes to the materials contained on its website at any time without notice.
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4 text-foreground">6. Links</h2>
        <p className="text-muted-foreground mb-4">
          PardonPath has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by PardonPath of the site. Use of any such linked website is at the user's own risk.
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4 text-foreground">7. Modifications</h2>
        <p className="text-muted-foreground mb-4">
          PardonPath may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4 text-foreground">8. Governing Law</h2>
        <p className="text-muted-foreground mb-4">
          These terms and conditions are governed by and construed in accordance with the laws of Ontario, Canada, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4 text-foreground">9. Contact Information</h2>
        <p className="text-muted-foreground mb-4">
          If you have any questions about these Terms of Service, please contact us at legal@pardonpath.ca
        </p>
      </div>
    </div>
  );
}
