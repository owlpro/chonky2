import { FullFileBrowser, type FileData } from 'chonky2';

const files: FileData[] = [
  { id: 'documents', name: 'Documents', isDir: true },
  { id: 'photo', name: 'Photo.png', size: 2_100_000 },
  { id: 'report', name: 'Report.pdf', size: 480_000 },
];

export default function PackagePreview() {
  return (
    <div style={{ height: '100%' }}>
      <FullFileBrowser
        files={files}
        folderChain={[{ id: 'home', name: 'Home', isDir: true }]}
      />
    </div>
  );
}
